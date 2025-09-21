import { Header } from "@/components/header"
import { DesignGenerator } from "@/components/design-generator"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Users, Zap, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12">
          <h1 className="text-4xl md:text-6xl font-bold text-balance">
            The fastest and most powerful
            <br />
            <span className="text-primary">platform for building AI house designs</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Generate stunning architectural concepts powered by advanced AI. Transform your ideas into professional
            house designs in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-8">
              Start Designing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              View Gallery
            </Button>
          </div>
        </section>

        {/* Design Generator Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Create Your Dream House</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Use our AI-powered design generator to create stunning architectural concepts. Simply describe your vision
              and watch it come to life.
            </p>
          </div>

          <Card className="p-8">
            <DesignGenerator />
          </Card>
        </section>

        {/* Features Section */}
        <section className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Why Choose Architecture.lk</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Professional architectural visualization made accessible to everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate professional house designs in seconds, not weeks. Our AI processes your requirements instantly.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Expert Consultation</h3>
              <p className="text-muted-foreground">
                Connect with certified architects for professional guidance and detailed project development.
              </p>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Sri Lankan Standards</h3>
              <p className="text-muted-foreground">
                All designs comply with local building codes and architectural standards specific to Sri Lanka.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center space-y-6 py-12">
          <h2 className="text-3xl font-bold">Ready to Design Your Dream House?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of homeowners who have brought their architectural visions to life
          </p>
          <Button size="lg" className="px-8">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </section>
      </main>
    </div>
  )
}
