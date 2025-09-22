import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  AlertTriangle,
  FileText,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Globe,
  Clock,
  Layers,
  Activity,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold">Sekuriti.io</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-gray-900">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="outline">Log In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            Enterprise-Grade Incident Response Platform
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
            Respond to Security Incidents
            <br />
            <span className="text-blue-600">Faster & Smarter</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sekuriti.io streamlines your incident response process with intelligent automation,
            comprehensive asset tracking, and battle-tested runbooks. Reduce response time by 70%
            and ensure compliance with industry standards.
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>GDPR Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Incident Response
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A complete platform that covers the entire incident lifecycle from detection to
              post-incident review.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <AlertTriangle className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Incident Management</h3>
              <p className="text-gray-600">
                Track incidents through all 6 phases with automated workflows, evidence
                collection, and real-time collaboration.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Layers className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Asset Inventory</h3>
              <p className="text-gray-600">
                Maintain a comprehensive inventory of all IT assets with criticality levels,
                dependencies, and ownership tracking.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <FileText className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Response Runbooks</h3>
              <p className="text-gray-600">
                Pre-built and customizable runbooks guide your team through response procedures
                with step-by-step actions.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Users className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Coordinate response efforts with role-based access, task assignments, and
                integrated communication tools.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <BarChart3 className="h-10 w-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Analytics & Reporting</h3>
              <p className="text-gray-600">
                Generate compliance reports, track metrics, and identify patterns to improve your
                security posture.
              </p>
            </Card>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <Activity className="h-10 w-10 text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Training Exercises</h3>
              <p className="text-gray-600">
                Run tabletop exercises and simulations to keep your team prepared for real
                incidents.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Security Teams Choose Sekuriti.io
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Zap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">70% Faster Response Time</h3>
                    <p className="text-gray-600">
                      Automated workflows and intelligent routing reduce mean time to respond
                      (MTTR) dramatically.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Lock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Enterprise Security</h3>
                    <p className="text-gray-600">
                      Bank-grade encryption, SSO support, and comprehensive audit logging for
                      complete security.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Globe className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Global Compliance</h3>
                    <p className="text-gray-600">
                      Meet regulatory requirements with built-in support for GDPR, HIPAA, SOC 2,
                      and more.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">24/7 Support</h3>
                    <p className="text-gray-600">
                      Expert support team available around the clock to help during critical
                      incidents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">2.5M+</div>
                  <p className="text-gray-600">Incidents Managed</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
                  <p className="text-gray-600">Enterprise Customers</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                  <p className="text-gray-600">Uptime SLA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Incident Response?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of security teams who trust Sekuriti.io
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="gap-2">
                Start Free Trial <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold text-white">Sekuriti.io</span>
              </div>
              <p className="text-sm">
                Enterprise incident response platform for modern security teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#about" className="hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white text-gray-500">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 Sekuriti.io. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}