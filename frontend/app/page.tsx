import { GradientMesh } from '@/components/gradient-mesh'
import { SiteNav } from '@/components/site-nav'
import { Hero } from '@/components/hero'
import { AppraisalDashboard } from '@/components/appraisal-dashboard'

export default function Page() {
  return (
    <div className="relative min-h-screen">
      <GradientMesh />

      <div className="relative z-10">
        <SiteNav />

        <main>
          <Hero />
          <AppraisalDashboard />
        </main>
      </div>
    </div>
  )
}