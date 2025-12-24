'use client';

import { SacredGeometryBackground } from '@/components/SacredGeometryBackground';

export default function GaiaPage() {
  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Section */}
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden bg-background">
        <SacredGeometryBackground />
        <div className="relative z-10 text-center px-8">
          <h1 className="font-display text-6xl font-medium tracking-tight text-foreground mb-4 animate-fade-in-up">
            GAIA™
          </h1>
          <p className="text-2xl text-muted-foreground mb-2 animate-fade-in-up animate-delay-100">
            Global Automated Intelligence Assurance
          </p>
          <p className="text-lg text-subtle animate-fade-in-up animate-delay-200">
            Semantic DLP for the GenAI era
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-12 space-y-16">
        {/* What is GAIA */}
        <section className="animate-fade-in-up animate-delay-300">
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            What is GAIA?
          </h2>
          <div className="bg-background border border-border p-8">
            <p className="text-muted-foreground leading-relaxed mb-4">
              GAIA is a next-generation Data Loss Prevention system designed specifically for the GenAI era. 
              Unlike traditional DLP that relies on regex patterns and keyword matching, GAIA uses semantic 
              analysis to understand the <em>meaning</em> of content being sent to AI assistants like ChatGPT and Claude.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              By combining code detection, secret scanning, fingerprint matching, and embedding-based similarity search, 
              GAIA can identify proprietary source code, trade secrets, and sensitive documents—even when they've been 
              renamed, refactored, or paraphrased.
            </p>
          </div>
        </section>

        {/* Core Capabilities */}
        <section>
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Core Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-background border border-border p-6 hover:border-foreground transition-colors">
              <div className="text-3xl mb-4">🔐</div>
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                Source Code Protection
              </h3>
              <p className="text-sm text-muted-foreground">
                Detects proprietary code in 40+ languages using AST parsing before it reaches GenAI services. 
                Catches complete files, partial snippets, and function-level pastes.
              </p>
            </div>

            <div className="bg-background border border-border p-6 hover:border-foreground transition-colors">
              <div className="text-3xl mb-4">🔑</div>
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                Secret Detection
              </h3>
              <p className="text-sm text-muted-foreground">
                Identifies API keys, tokens, passwords, and credentials embedded in prompts. 
                Supports AWS, GCP, GitHub, Stripe, and 50+ other secret formats.
              </p>
            </div>

            <div className="bg-background border border-border p-6 hover:border-foreground transition-colors">
              <div className="text-3xl mb-4">📋</div>
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                Trade Secret Shield
              </h3>
              <p className="text-sm text-muted-foreground">
                Privacy-preserving fingerprint matching for crown-jewel documents. 
                Matches against protected repositories without storing reconstructable code.
              </p>
            </div>

            <div className="bg-background border border-border p-6 hover:border-foreground transition-colors">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="font-display text-lg font-medium text-foreground mb-2">
                Semantic Analysis
              </h3>
              <p className="text-sm text-muted-foreground">
                CodeBERT and sentence-transformer embeddings catch renamed, refactored, 
                or paraphrased content that evades traditional pattern matching.
              </p>
            </div>
          </div>
        </section>

        {/* Detection Pipeline */}
        <section>
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Detection Pipeline
          </h2>
          <div className="bg-background border border-border p-8 overflow-x-auto">
            <div className="flex items-center gap-4 min-w-[800px]">
              {/* Step 1 */}
              <div className="flex-shrink-0 text-center">
                <div className="w-20 h-20 border border-foreground flex items-center justify-center mb-2">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-xs text-muted-foreground">Prompt<br/>Input</p>
              </div>
              <div className="text-subtle">→</div>

              {/* Step 2 */}
              <div className="flex-shrink-0 text-center">
                <div className="w-20 h-20 border border-border bg-background-subtle flex items-center justify-center mb-2">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-xs text-muted-foreground">Code<br/>Classifier</p>
              </div>
              <div className="text-subtle">→</div>

              {/* Step 3 */}
              <div className="flex-shrink-0 text-center">
                <div className="w-20 h-20 border border-border bg-background-subtle flex items-center justify-center mb-2">
                  <span className="text-2xl">🔑</span>
                </div>
                <p className="text-xs text-muted-foreground">Secret<br/>Scanner</p>
              </div>
              <div className="text-subtle">→</div>

              {/* Step 4 */}
              <div className="flex-shrink-0 text-center">
                <div className="w-20 h-20 border border-border bg-background-subtle flex items-center justify-center mb-2">
                  <span className="text-2xl">🔗</span>
                </div>
                <p className="text-xs text-muted-foreground">Fingerprint<br/>Matcher</p>
              </div>
              <div className="text-subtle">→</div>

              {/* Step 5 */}
              <div className="flex-shrink-0 text-center">
                <div className="w-20 h-20 border border-border bg-background-subtle flex items-center justify-center mb-2">
                  <span className="text-2xl">🧠</span>
                </div>
                <p className="text-xs text-muted-foreground">Semantic<br/>Embeddings</p>
              </div>
              <div className="text-subtle">→</div>

              {/* Step 6 */}
              <div className="flex-shrink-0 text-center">
                <div className="w-20 h-20 border border-foreground bg-background flex items-center justify-center mb-2">
                  <span className="text-2xl">⚖️</span>
                </div>
                <p className="text-xs text-muted-foreground">Policy<br/>Engine</p>
              </div>
              <div className="text-subtle">→</div>

              {/* Step 7 - Actions */}
              <div className="flex-shrink-0">
                <div className="flex flex-col gap-2">
                  <div className="px-4 py-2 border border-border text-center">
                    <span className="text-xs font-medium text-foreground">✓ Allow</span>
                  </div>
                  <div className="px-4 py-2 border border-border bg-background-subtle text-center">
                    <span className="text-xs font-medium text-muted-foreground">⚠ Coach</span>
                  </div>
                  <div className="px-4 py-2 border border-foreground text-center">
                    <span className="text-xs font-medium text-foreground">✕ Block</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Implementation Phases */}
        <section>
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Implementation Roadmap
          </h2>
          <div className="bg-background border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background-subtle">
                  <th className="text-left px-6 py-4 text-xs font-medium text-subtle uppercase tracking-wider">Phase</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-subtle uppercase tracking-wider">Focus Area</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-subtle uppercase tracking-wider">Duration</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-subtle uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">1-2</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Proxy Foundation + Prompt Extraction</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">4 weeks</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs border border-border text-muted-foreground">Planned</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">3</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Code Detection + Enforcement Actions</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">3 weeks</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs border border-border text-muted-foreground">Planned</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">4</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Admin Console MVP</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">2 weeks</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs border border-border text-muted-foreground">Planned</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">5-6</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Fingerprinting + Semantic Embeddings</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">6 weeks</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs border border-border text-muted-foreground">Planned</span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">7</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">Upload Scanning + Response Controls</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">2 weeks</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs border border-border text-muted-foreground">Planned</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Policy Model */}
        <section>
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Policy Model
          </h2>
          <div className="bg-background border border-border p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Policies define Who can send What to Where, and what Action to take:
            </p>
            <pre className="bg-background-subtle border border-border p-4 text-sm text-foreground overflow-x-auto">
{`{
  "policy": {
    "name": "GenAI Source Code Protection",
    "who": {
      "groups": ["engineering", "contractors"],
      "exclude_groups": ["security-team"]
    },
    "where": {
      "destinations": ["chat.openai.com", "claude.ai"]
    },
    "what": {
      "data_classes": ["source_code", "crown_jewel", "trade_secret"],
      "confidence_threshold": 0.7
    },
    "action": {
      "high_confidence": "block",
      "medium_confidence": "coach",
      "low_confidence": "allow"
    }
  }
}`}
            </pre>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="pb-8">
          <h2 className="font-display text-2xl font-medium text-foreground mb-6">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-background border border-border p-6">
              <h3 className="font-display text-sm font-medium text-foreground uppercase tracking-wider mb-4">
                Interception Layer
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• mitmproxy / Go net/http</li>
                <li>• Chrome MV3 Extension</li>
                <li>• PAC files / GRE tunnels</li>
              </ul>
            </div>

            <div className="bg-background border border-border p-6">
              <h3 className="font-display text-sm font-medium text-foreground uppercase tracking-wider mb-4">
                DLP Engine
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• tree-sitter (AST parsing)</li>
                <li>• detect-secrets / trufflehog</li>
                <li>• CodeBERT embeddings</li>
                <li>• Qdrant / Milvus vector DB</li>
              </ul>
            </div>

            <div className="bg-background border border-border p-6">
              <h3 className="font-display text-sm font-medium text-foreground uppercase tracking-wider mb-4">
                Audit & Evidence
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• PostgreSQL + TimescaleDB</li>
                <li>• Apache Kafka (SIEM)</li>
                <li>• SHA-256 / BLAKE3 hashing</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

