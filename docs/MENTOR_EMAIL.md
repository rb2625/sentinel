Subject: SENTINEL - Questions for Mentorship Phase (GSMA MENA Ignite Hackathon)

Dear Ahmed,

I hope this message finds you well. My name is Rabeeh, and I am the solo developer behind Team SENTINEL, which was shortlisted in the Idea Phase of the GSMA MENA Ignite Hackathon.

First, thank you for volunteering your time as a mentor. I have a few focused questions that would help me strengthen the prototype before the September 13 deadline.

---

Question 1: AI Agent Framework Compliance

Our AI agent layer follows the CrewAI architecture pattern (Agent -> Task -> Crew with defined roles: Validator, Classifier, Anomaly Detector). However, due to a Python version constraint (our environment runs Python 3.14, while CrewAI requires 3.10-3.13), we implemented a compatible layer that uses the exact same Agent/Task/Crew/Tool abstractions with Groq Llama 3.3 70B as the LLM backend.

Would this be considered compliant with the hackathon's requirement that "the AI agent component must be built only using the tools listed in the Resource & Tooling Guide"? Or should we restructure our environment to use CrewAI directly?

---

Question 2: CAMARA API Usage in Demo

For the 3-minute demo video, should the CAMARA API calls show real responses from the Nokia Network-as-Code simulator (sandbox mode), or is it acceptable to use cached/simulated responses with a note that the real integration is tested locally?

We have the Nokia NaC API key configured and the CAMARA client works against the simulator endpoints. The question is about demo reliability and what judges expect.

---

Question 3: What Differentiates Winning Teams

Based on your experience, what separates the top submissions from the rest in Phase 2? Is it the technical depth of the CAMARA integration, the quality of the working prototype, the clarity of the pitch, or something else entirely?

Any guidance on where to focus the remaining days would be invaluable.

---

Question 4: Solo Developer vs Team

I am building this entirely solo. Does the evaluation criteria account for this, or are solo teams held to the same standard as 5-person teams? I want to make sure I am allocating my limited time effectively.

---

I understand you are supporting multiple teams and appreciate any brief responses you can provide. I do not need a formal meeting if email responses are more convenient for you.

Thank you for your time and expertise.

Best regards,
Rabeeh
Team SENTINEL
GitHub: github.com/rb2625/sentinel
Email: rabeehmattath1998@gmail.com
