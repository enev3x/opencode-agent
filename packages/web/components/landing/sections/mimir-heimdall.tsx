import type { JSX } from "react"
import { getTranslations } from "next-intl/server"
import { Brain, Layers, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export async function MimirHeimdallSection(): Promise<JSX.Element> {
  const t = await getTranslations("landing")

  return (
    <section className="border-y border-white/5 bg-[#0a0a0a] py-24" data-section="mimir-heimdall">
      <div className="reveal-on-enter container mx-auto px-4 md:px-6">
        <div className="mb-16 text-center">
          <Badge className="mb-6 border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-violet-400">
            {t("mimirHeimdall.badge")}
          </Badge>
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            {t("mimirHeimdall.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-zinc-400">{t("mimirHeimdall.headline")}</p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <Card className="h-full border-zinc-800 bg-zinc-900/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-violet-400/10 p-2">
                    <Brain className="h-6 w-6 text-violet-400" />
                  </div>
                  <Badge variant="outline" className="border-zinc-700 text-xs text-zinc-400">
                    {t("mimirHeimdall.mimir.model")}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-2xl text-violet-400">
                  {t("mimirHeimdall.mimir.name")}
                </CardTitle>
                <CardDescription className="font-medium text-zinc-400">
                  {t("mimirHeimdall.mimir.role")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-zinc-300">
                  {t("mimirHeimdall.mimir.description")}
                </p>
                <ul className="space-y-2">
                  {([0, 1, 2, 3] as const).map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                      <ArrowRight className="h-3 w-3 shrink-0 text-violet-400" />
                      {t(`mimirHeimdall.mimir.features.${i}`)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full border-zinc-800 bg-zinc-900/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-violet-400/10 p-2">
                    <Layers className="h-6 w-6 text-violet-400" />
                  </div>
                  <Badge variant="outline" className="border-zinc-700 text-xs text-zinc-400">
                    {t("mimirHeimdall.heimdall.model")}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-2xl text-violet-400">
                  {t("mimirHeimdall.heimdall.name")}
                </CardTitle>
                <CardDescription className="font-medium text-zinc-400">
                  {t("mimirHeimdall.heimdall.role")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="leading-relaxed text-zinc-300">
                  {t("mimirHeimdall.heimdall.description")}
                </p>
                <ul className="space-y-2">
                  {([0, 1, 2, 3] as const).map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                      <ArrowRight className="h-3 w-3 shrink-0 text-violet-400" />
                      {t(`mimirHeimdall.heimdall.features.${i}`)}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/20 p-6 md:p-8">
            <div className="flex min-w-[600px] flex-col items-start justify-between gap-4 md:min-w-0 md:flex-row md:items-center md:gap-0">
              {([1, 2, 3, 4, 5] as const).map((step, i) => (
                <div key={step} className="flex flex-1 items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 font-mono text-xs text-zinc-400">
                      {step}
                    </div>
                    <span className="text-sm whitespace-nowrap text-zinc-300">
                      {t(`mimirHeimdall.workflow.step${step}`)}
                    </span>
                  </div>
                  {i < 4 && (
                    <ArrowRight className="ml-auto hidden h-4 w-4 shrink-0 text-zinc-600 md:block" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-6 border-t border-zinc-800 pt-6 text-center text-zinc-400 italic">
              {t("mimirHeimdall.whyItWorks")}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
