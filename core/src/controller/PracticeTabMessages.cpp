#include "controller/PracticeTabMessages.h"

#include "MessageHandlerRegistry.h"
#include "models/ModelHasher.h"
#include "storage/JsonStore.h"
#include "util/Base64.h"
#include "util/FileIO.h"
#include "util/PathEncoding.h"

#include <chrono>
#include <cstdint>
#include <memory>
#include <span>
#include <vector>

#include <nlohmann/json.hpp>

namespace guitarfx
{
namespace
{
constexpr const char* kErrorTitle = "Unable to open tablature";

// Optional correlation preserves clients that predate cancellable score loading.
std::string RequestId(const nlohmann::json& payload)
{
    const auto value = payload.find("requestId");
    return value != payload.end() && value->is_string() && value->get_ref<const std::string&>().size() <= 128
               ? value->get<std::string>()
               : std::string{};
}

void Reply(const PracticeTabMessageDeps& deps, nlohmann::json message, const std::string& requestId)
{
    if (!requestId.empty())
    {
        message["requestId"] = requestId;
    }
    deps.sendToUI(message.dump());
}

void ReportImportError(const PracticeTabMessageDeps& deps, const std::string& error, const std::string& requestId)
{
    deps.reportError(kErrorTitle, error);
    if (!requestId.empty())
    {
        Reply(deps, {{"type", "practiceToolTabFailed"}, {"error", error}}, requestId);
    }
}

/// The file's own name, without folders, and never empty — it labels the tab in the UI.
std::string CleanFileName(const std::string& name)
{
    const auto slash = name.find_last_of("/\\");
    std::string base = slash == std::string::npos ? name : name.substr(slash + 1);
    return base.empty() ? std::string("Tablature") : base;
}

/// Stores the score under its content hash (the same file opened twice is one row) and
/// hands it to the UI. Returns false, having reported why, when it cannot be kept.
bool StoreAndSend(const PracticeTabMessageDeps& deps, const std::string& fileName,
                  const std::vector<std::uint8_t>& bytes, const std::string& requestId)
{
    if (bytes.empty())
    {
        ReportImportError(deps, "The file is empty.", requestId);
        return false;
    }

    if (bytes.size() > kMaxPracticeTabBytes)
    {
        ReportImportError(deps, "The file is larger than 16 MB, which is more than any score needs.", requestId);
        return false;
    }

    const std::string id = ModelHasher().HashBytes(std::span<const std::uint8_t>(bytes.data(), bytes.size()));
    const std::string name = CleanFileName(fileName);
    const std::string data = util::EncodeBase64(bytes);
    const auto now =
        std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::system_clock::now().time_since_epoch())
            .count();

    const nlohmann::json document = {{"fileName", name}, {"data", data}, {"size", bytes.size()}, {"storedAt", now}};

    if (!deps.store().Put(storage::ItemType::kPracticeTab, id, document))
    {
        ReportImportError(deps, "The file could not be saved to the library.", requestId);
        return false;
    }

    Reply(deps, {{"type", "practiceToolTabLoaded"}, {"id", id}, {"fileName", name}, {"data", data}}, requestId);
    return true;
}

void SendFailed(const PracticeTabMessageDeps& deps, const std::string& id, const std::string& error, const std::string& requestId)
{
    Reply(deps, {{"type", "practiceToolTabFailed"}, {"id", id}, {"error", error}}, requestId);
}
} // namespace

void RegisterPracticeTabMessages(MessageHandlerRegistry& registry, PracticeTabMessageDeps deps)
{
    auto shared = std::make_shared<PracticeTabMessageDeps>(std::move(deps));

    registry.Register("browsePracticeToolTab", [shared](const nlohmann::json& payload) {
        const auto requestId = RequestId(payload);
        shared->browseForTab([shared, requestId](const BrowseFileResult& result) {
            if (!result.success)
            {
                if (!requestId.empty())
                {
                    Reply(*shared, {{"type", "practiceToolTabFailed"}, {"cancelled", true}}, requestId);
                }
                return;
            }

            std::error_code error;
            const auto size = std::filesystem::file_size(result.path, error);

            if (!error && size > kMaxPracticeTabBytes)
            {
                ReportImportError(*shared, "The file is larger than 16 MB, which is more than any score needs.", requestId);
                return;
            }

            const auto bytes = util::ReadFileBytes(result.path);

            if (bytes.empty())
            {
                ReportImportError(*shared, "The file could not be read: " + util::PathToUtf8(result.path), requestId);
                return;
            }

            StoreAndSend(*shared, util::PathToUtf8(result.path.filename()), bytes, requestId);
        });
    });

    registry.Register("importPracticeToolTabData", [shared](const nlohmann::json& payload) {
        const auto requestId = RequestId(payload);
        const std::string encoded = payload.value("data", "");

        // The base64 of the largest file allowed, with room for padding.
        if (encoded.size() > (kMaxPracticeTabBytes / 3 + 1) * 4)
        {
            ReportImportError(*shared, "The file is larger than 16 MB, which is more than any score needs.", requestId);
            return;
        }

        StoreAndSend(*shared, payload.value("fileName", ""), util::DecodeBase64(encoded), requestId);
    });

    registry.Register("requestPracticeToolTab", [shared](const nlohmann::json& payload) {
        const auto requestId = RequestId(payload);
        const std::string id = payload.value("id", "");

        if (id.empty())
        {
            return;
        }

        const auto stored = shared->store().Get(storage::ItemType::kPracticeTab, id);

        if (!stored || !stored->is_object() || !stored->contains("data") || !(*stored)["data"].is_string())
        {
            SendFailed(*shared, id, "This tablature is no longer in the library. Open the file again.", requestId);
            return;
        }

        Reply(*shared, nlohmann::json{{"type", "practiceToolTabLoaded"},
                                        {"id", id},
                                        {"fileName", stored->value("fileName", std::string("Tablature"))},
                                        {"data", (*stored)["data"]}}, requestId);
    });
}
} // namespace guitarfx
