"use client"
import { useLanguage } from "@/contexts/language-context"
import { useAuth } from "@/components/auth-provider"
import { useState } from "react"

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-[#0f0f10] text-white">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-3xl font-bold">{t("settings.title")}</h1>

            <div className="space-y-6">
              {/* User Information Section */}
              <div className="rounded-md border border-[#333333] bg-[#111] p-6">
                <h2 className="mb-4 text-xl font-semibold">{t("settings.userInformation")}</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">{t("profile.email")}</p>
                    <p className="text-lg">{user?.email || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">{t("settings.userId")}</p>
                    <p className="text-lg">{user?.id || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">{t("settings.accountCreated")}</p>
                    <p className="text-lg">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</p>
                  </div>
                </div>
              </div>

              {/* Language Section */}
              <div className="rounded-md border border-[#333333] bg-[#111] p-6">
                <h2 className="mb-4 text-xl font-semibold">{t("settings.language")}</h2>

                {/* Language Selection */}
                <div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setLanguage("en")}
                      className={`px-4 py-2 rounded-md ${
                        language === "en" ? "bg-indigo-600 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
                      }`}
                    >
                      {t("language.english")}
                    </button>
                    <button
                      onClick={() => setLanguage("ar")}
                      className={`px-4 py-2 rounded-md ${
                        language === "ar" ? "bg-indigo-600 text-white" : "bg-[#1a1a1a] text-gray-300 hover:bg-[#252525]"
                      }`}
                    >
                      {t("language.arabic")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
