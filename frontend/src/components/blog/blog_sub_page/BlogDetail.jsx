import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import { auth } from '../../../FirebaseConfig';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Dummy data to simulate fetching blog details
    const dummyData = {
      1: {
        title: "Setting the revenue cycle up for success in automation and AI",
        content: "This is a detailed article about automating denial workflows using AI...",
        header_image: "/demo_header_blog.png",
        data: [
          {
            h: "As new technologies emerge, revenue cycle leaders can prepare to harness the potential of these capabilities by establishing the conditions for success today."
          },
          {
            p: "The financial pressures US health systems have long grappled with have worsened over the last several years.1 To be sure, productivity of administrative functions has increased to counter these pressures, but most of the gains over the last 20 years have been through labor, not capabilities or process improvement.2"
          },
          {
            p: "Technologies such as automation and analytics—and more recently, generative AI (gen AI)—could help improve performance. In fact, research suggests that effectively deploying automation and analytics alone could eliminate $200 billion to $360 billion of spending in US healthcare.3 Some of these savings would come from administrative functions (including revenue cycle management [RCM]) or nonclinical parts of healthcare provisioning (including scheduling, coordinating care with insurers, documentation, and claim or bill adjudication). Deploying such technologies may also reduce clinician burnout and improve patient experience, which are both increasingly important in how healthcare is evolving."

          },
          {
            p: "In this article, we focus on how the RCM function could lay the foundation to harness technology to contribute to better system performance. The function is manual, complex, and dependent on stakeholders throughout health systems. In other words, RCM performance hinges on effective and timely collaboration. The potential of recent advances in technology, particularly gen AI, have highlighted the need to consider—or reconsider—incorporating these advancements into administrative functions, and doing so effectively holds the promise of further separating the health systems that thrive and grow from those that do not."

          },
          {
            p: "Leaders of health systems have often been skeptical of opportunities for tech-enabled performance improvement after years of automation and analytics projects that have not generated expected value, both within and beyond administrative functions. In addition to perceived technology limitations, these outcomes often resulted from operational challenges, skills gaps, a failure to improve the foundational infrastructure upon which technology depends, and approaches to deployment and measurement that weigh on projects from the start."
          },
          {
            p: "Overcoming these challenges and capitalizing on the next wave of technologic innovation entails investing in the right mindsets, infrastructure, and capabilities throughout the revenue cycle and beyond. Specifically, healthcare organizations would need the following:"
          },

          { p: "top-team commitment to technology efforts, backed by a long-term vision" },
          { p: "a holistic approach to investing in technology instead of one based on ad hoc funding of one-off experiments" },
          { p: "a clear path to move offerings from pilot to systemwide adoption, with distinct deployments for pilots and full-scale implementation and tailored change management" },
          { p: "a talent strategy that ensures technology efforts are led and supported by teams with experience in business, technology, and healthcare" },
          { p: "holistic indicators of future value to measure success" },
          { p: "Operating in these different ways necessarily requires a change in approach, but the outcome could help health systems access untapped potential and do so in time for exciting opportunities to come." },
          { h: "Value from automation and analytics in revenue cycle management has been elusive" },
          {
            p: `In our experience, technology deployments in RCM are often hampered by four things:

partial solutions—fit for purpose to minimize up-front investment—that fail to generate significant value because they never reach the minimum threshold for impact
new technology implementations that don’t account for refining and customizing solutions, transitional periods, trial and error, or system downtime
skills gaps spanning functions—such as technology, reimbursement, or finance—that slow or outright halt technology implementation
competing challenges, such as operations under crisis (including the COVID-19 pandemic), electronic health-record implementation, and a rapidly evolving regulatory environment, resulting in limited bandwidth for individuals and impeding collaboration critical for solution development
As a result, some executives have stepped back from investing in bold bets on technology, part of a general hesitancy to support initiatives that could produce high rewards but that also require teams to fail fast and pivot quickly if needed. Modest investments in proven technologies are now the norm and paradoxically prevent the realization of meaningful outcomes.`},
          { h: "Overcoming challenges and capitalizing on the next wave of technologic innovation entails investing in the right mindsets, infrastructure, and capabilities throughout the revenue cycle and beyond." },
          {
            p: `These smaller-scale investments are not inherently less likely to succeed, but health systems often omit essential elements, which essentially doom them to fail. Many technology deployments purchase solutions for pilots without sufficiently considering their potential to eventually scale across the enterprise, which could cap the impact of the pilot. The business case for the solution becomes more challenging when the potential investment is evaluated based only on its short-term value rather than the full potential of the new technologies to the organization.
  For instance, many health systems have piloted tech-enabled solutions to streamline prior authorizations from insurers. But stakeholders generally fail to update their tech stack and workflows, train staff to optimally use updated technology, and redesign affected processes to fully capture value. As a result, these pilots tend to fall short of stakeholders’ initial hopes, lack enterprise scalability, and limit sustainability of impact for the organization.

Now, with the emergence of gen AI technologies, health systems are at risk of missing an early window to set the stage to realize value from it in administrative processes unless they reconsider their approach. (For more on gen AI, see sidebar, “Generative AI: Considerations and risks.”)`},
          { h: "Learning from successes" },
          { p: `While it may take some time before robust gen AI solutions become commercially available in healthcare—and even longer for enterprise scalable products to be usable in revenue cycle management—health systems can begin to prepare now since these technologies will be imperative to performance in the future. Starting with an understanding of their own capabilities, the most successful deployers of advanced technologies have some characteristics in common. Successfully leveraging automation and AI requires top leaders’ commitment to continuous improvement. Teams could reset how they measure the value created by pilots to be more holistic and long-term. Across the organization, teams could be set up and resourced to support the success of pilots and scaled implementations. The technology ecosystem can be adjusted to support the new technology. The right talent at the right time is another critical enabler.` },
          {
            h: "Assessment of pilots according to their long-term value"
          },
          {
            p: `Choosing and tracking the right metrics could mean the difference between uncovering surprising insights and a failed experiment. In piloting technology solutions, health system stakeholders often look for rapid monetary impact. By those standards, almost all pilots would be doomed to fail.

Instead, decision makers would ideally evaluate pilots holistically. First, what do a pilot’s outcomes suggest about how it could help clinicians and patients have better experiences? Second, how might the pilot translate into long-term bottom-line impact if it were scaled? Last, what kind of near-term benefit—operationally and financially but also for key stakeholders in healthcare—might it realistically bring? These questions are necessarily broad, so evaluating pilots may require looking at measures of progress traditional financial metrics may not reflect.

For example, solutions deployed to reduce write-offs from denials may not achieve this goal over the relatively short time period during a pilot. However, the solutions may allow revenue cycle operators to work more efficiently by increasing the quantity and quality of claims processed, which would translate to value seen in lagging indicators such as write-off amount. But organizations that focus only on a limited set of metrics, such as write-off value, may be inclined to decommission such a pilot quickly. This would hamper the adoption of automation and analytics in the revenue cycle even though those solutions often have meaningful value in the medium to longer term and create value in other ways. In this example, there is an opportunity to reduce unnecessary correspondence between payers and providers to improve staff experiences, reduce high volumes of work that can contribute to burnout, and reduce the stress that denial of payment creates for patients.`},
          {
            h: "Coordination across the organization"
          },
          {
            p: `As with any complex undertaking, coordination is key. Revenue cycle teams cannot shoulder an overhaul of their operations alone. Health systems’ complex organizational structures make collaboration across departments necessary even when difficult.

Part of this coordination will involve making the right tradeoffs for the organization and updating departments’ incentives to reflect those decisions. For instance, an automation or gen AI solution may decrease accounts receivable days (the average length of time between invoicing and payment) but increase the average number of days it takes to submit a bill. This tradeoff may make the most sense for the organization because it ensures that documentation is accurate and comprehensive.

The most effective RCM operators set out to understand how their organizations work in the context of stakeholders’ journeys through a given process, particularly the pain points along the way. One outcome of this understanding is insight into where and how tasks can leverage new technology effectively. Just as importantly, these journeys show where and how new technology and processes will interface with legacy processes (and ultimately inform where upgrades may be required).`}

          ,
          { h: "Support of the new technology with ecosystem elements" },
          {
            p: `
  A technology solution is unlikely to yield the desired outcomes if it is dropped into entrenched tech environments, processes, and ways of working without accounting for the broader technology ecosystem. For example, an algorithm designed to identify claims with higher likelihoods of clinical denial prior to submission may require updated workflows to recognize these risks—and certainly to address them. Before submitting a claim, organizations may create preventative workflows to assess and address claim gaps that lessen denial likelihood. To effectively take preventative actions, staff may need to be retrained on how to preemptively attach additional documentation, clinicians may need to update their approaches to documentation, and payor contracting teams may need to understand how changes in the operating model can improve collaboration with insurers that request documentation or deny payment. One critical move is to structure and streamline the system’s technology ecosystem, from vendors all the way down to health system data. Healthcare provider technology ecosystems and provider data are often messy, difficult to access, and difficult to navigate. Organizing the ecosystem in a structured way that is accessible and easy to navigate can help streamline new implementations, simplify data governance, reduce the risk of unexpected (or unknown) vendor capability duplication, and reduce potential errors across the system.

The potential impact could be significant: structuring and creating notes while also enabling clinicians to address and reconcile documentation gaps early—even in real time—can be transformative, freeing up significant time both in the context of a patient visit (thereby improving patience experience) and after. In the most optimistic future, one could imagine enabling payers and providers to align on clinical protocols in collaboration to improve individual and population health.
  `},
          {
            h: "Talent and expertise that covers relevant areas"
          },

          {
            p: `Deploying automation and analytics (and eventually, gen AI) works best in a setting where the talent involved has the time and expertise to be effective. Often, a project will be an additional task for a leader who already has a full slate of responsibilities and who has only some of the expertise needed to make the most of new technology.

Experts in different domains across the organization could help decision makers identify and prioritize feasible, effective technology use cases, allowing existing teams to focus on their own work. Leaders with domain experience and knowledge of pain points in the revenue cycle can quantify the possible impact of use cases; healthcare operators and clinicians can point out potential workflow and process pitfalls; practitioners with experience deploying technology in healthcare can assess use cases’ technical feasibility and guard against technology-specific challenges before they arise; and value assurance and expert technical translators could help ensure that progress is pegged to eventual value with a clear link between business and technology. Cross-competency training is also helpful to unlock new opportunities to collaborate more effectively.

To be sure, technology talent is hard to come by, and the United States has more open positions than candidates, especially in healthcare. Although it is critical to attract and retain analytics and automation talent, our experience shows that successful technology deployments tend to feature partnerships across the organization to identify opportunities to create value. In the longer term, an internal academy to upskill the existing workforce, a talent recruitment and retention plan within specific technology domains, and fresh ways to innovate and collaborate are crucial to fully unlock the potential of automation and analytics while also attracting the right talent to these massive healthcare challenges.

US healthcare systems are at a critical juncture. New ways of working, enabled by technology, will be fundamental to righting the ship or continuing to succeed. Leaders and teams that successfully shift their mindsets will be best placed to weather this challenging time.

`}

        ],
        created_at: "June 25, 2024",
        author: "By Sanjiv Baxi, Sagar Parikh, Michael Peterson, and Andrew Ray"
      },
      2: {
        title: "Claim Denial Prediction: Harnessing AI For Healthcare Revenue Cycle Management",
        content: "This article discusses how Aaftaab AI addresses and fixes issues in denials...",
        header_image: "https://imageio.forbes.com/specials-images/imageserve/66d9f69afbda5c12b7d194e8//960x0.jpg?format=jpg&width=1440",
        data: [
          {
            p: "Claim denials pose a significant challenge in healthcare, leading to financial losses, operational inefficiencies and disruptions in patient care. Managing and mitigating these denials requires substantial time and resources, often diverting attention from patient-centric activities. The advent of artificial intelligence (AI) offers the transformative potential to address these challenges. By integrating AI into revenue cycle management (RCM), healthcare organizations can proactively predict and prevent claim denials, streamline processes and enhance efficiency."
          },
          {
            h: "The Challenge of Claim Denials in Healthcare"
          },
          {
            p: "Claim denials occur for various reasons, including coding errors, incomplete documentation and noncompliance with payer requirements. Each denial not only delays reimbursement but also adds to administrative costs, ultimately affecting healthcare providers’ financial health. Traditional methods of handling claim denials are often reactive and labor-intensive, leading to significant revenue leakage. A proactive, data-driven approach is more critical than ever to tackle this persistent issue."
          },

          {
            p: "AI technology brings a new dimension to RCM by leveraging advanced algorithms and machine learning models to predict claim denials before they happen. AI can provide actionable insights by analyzing historical data and identifying patterns, enabling healthcare providers to take preventive measures. This proactive approach reduces the occurrence of denials and enhances the overall efficiency of the revenue cycle."
          },
          {
            h: "The Potential of AI in Revenue Cycle Management"
          },
          {
            p: "AI-driven solutions enable healthcare organizations to adopt proactive claim management strategies. Predictive analytics can identify claims at risk of being denied, allowing staff to address potential issues before submission. This reduces the likelihood of denials and accelerates the reimbursement process. Additionally, AI can automate routine tasks such as eligibility verification and pre-authorization, enabling staff to focus on more complex cases."
          },
          {
            h: "Business Impact and Applications"
          },
          {
            p: "Accurate medical coding is crucial for minimizing claim denials. AI can improve coding practices by providing real-time feedback and suggesting appropriate codes based on clinical documentation. AI-powered training programs can also help staff stay up to date with the latest coding standards and payer requirements."
          },
          {
            p: "AI can optimize revenue cycle workflows by streamlining processes and reducing manual intervention. For instance, natural language processing (NLP) can be used to extract relevant information from clinical notes, ensuring that claims are complete and accurate. Meanwhile, machine learning algorithms can prioritize claims based on their likelihood of approval, enabling staff to focus on high-priority cases. This optimization leads to faster claim processing times, reduced administrative costs and improved cash flow."
          },
          {
            p: "Implementing AI in RCM requires making an initial investment in technology and training. However, the long-term benefits can far outweigh the costs. AI can significantly increase revenue by reducing claim denials and improving operational efficiency. The savings from decreased administrative tasks and faster reimbursement cycles can offset the initial investment. A comprehensive cost-benefit analysis can help healthcare organizations understand the financial impact of AI implementation and make informed decisions."
          },
          {
            p: "Integrating AI into RCM necessitates stringent measures to ensure patient data privacy and security. Healthcare organizations must adhere to data protection regulations and implement robust security protocols to safeguard sensitive information. Encryption, access controls and regular audits are essential to prevent data breaches and maintain patient trust. AI systems should be designed with privacy in mind, ensuring that data is anonymized and used responsibly."
          },
          {
            p: "Compliance with healthcare regulations such as the Health Insurance Portability and Accountability Act (HIPAA) is of paramount importance when implementing AI solutions. To ensure their AI systems meet regulatory standards and maintain compliance, healthcare organizations should conduct regular compliance audits, train staff on regulatory requirements and keep up to date with any changes in legislation. Adhering to these regulations ensures legal compliance and reinforces the ethical use of AI in healthcare."
          },
          {
            h: "Conclusion"
          },
          {
            p: "Integrating AI in RCM offers immense potential to transform how healthcare organizations handle claim denials and reduce the likelihood of them occurring in the first place. AI can significantly enhance operational efficiency and financial performance by enabling organizations to adopt proactive claim management strategies, improve coding practices and optimize workflows. However, addressing ethical considerations and ensuring compliance with healthcare regulations to protect patient data and maintain trust is crucial."
          },
          {
            p: "As a CTO, I’ve witnessed AI’s transformative power in healthcare operations. By investing in AI technology and fostering a culture of continuous learning and improvement, organizations can stay ahead of the curve and ensure long-term success."
          },

        ]
        , author: `Paul Kovalenko
Forbes Councils Member
Forbes Technology Council`,
        created_at: "Sep 6, 2024"

      },
      3: {
        title: "AI is just one piece of healthcare's RCM puzzle",
        content: "This article discusses how Aaftaab AI addresses and fixes issues in denials...",
        header_image: "https://res.cloudinary.com/alixpartners/image/upload/v1719329556/Imagery/Insights/Healthcare%20revenue%20cycle%20%282024%29/HC_test_-_revenue_cycle-01_xzbxj7.jpg",
        data: [
          {
            p: "Healthcare operators face growing denial rates and longer reimbursement timelines. AI can help, but it’s just one facet of revenue cycle management, and can’t be implemented without an understanding of the end-to-end processes. Healthcare operators are facing a cash crunch. Insurance denials typically range from 10% to 20% of claims, according to a ProPublica investigation, though KFF has found Medicaid claim denials go as high as 49%, and advanced claims review systems have contributed to the issue. Several large insurers are facing litigation over their use of AI and advanced technology to review (and deny) claims, and legislators are looking at how to regulate that technology. For now, that means there's an increasing probability that providers have done the work … but haven’t been paid."
          },
          {
            h: "The Growing Challenge of Denial Rates in Healthcare"
          },
          {
            p: "AI-powered solutions can efficiently manage complex billing procedures, reduce errors, and improve claims processing by predicting which charges are likely to go unpaid and forecasting payment lag times. Recent advances in large language models provide streamlined, automated solutions for claims appeals and dispute resolution."
          },
          {
            p: "For the majority of our healthcare clients, though, a better AI claims-lodgment process isn’t going to solve everything—companies need immediate financial relief, and payor management is bigger than a set of new tools."
          },
          {
            h: "AI Solutions and Financial Relief"
          },
          {
            p: "RCM sits at the hub of a series of complex processes and can’t be toggled on its own. For that reason, we approach the financial puzzle from a holistic standpoint: when a company needs to enhance liquidity or may be in distress, we unpick the web of roles, processes, and systems, and locate where in the RCM function a company loses opportunity for revenue."
          },
          {
            p: "From the front to the back end of the revenue cycle, there are opportunities to improve data collection and management, integrate workflows, modernize practices, and improve efficiencies. AlixPartners can deploy AI-enabled tools to consolidate, clean, and secure disparate data according to regulatory requirements to identify opportunities and unlock potential within the existing RCM process."
          },
          {
            h: "Holistic Approach to RCM"
          },
          {
            p: "Done well, RCM improvements will focus collection efforts to improve yield, enable more granular portfolio management, and manage risk more efficiently. Ultimately, companies will see increased EBITDA by getting more yield from the work they’ve already done, improved cash management with faster collection times and lower reserve requirements, and a lower cost to collect through improved efficiencies."
          },
          {
            h: "Impact of RCM Improvements"
          },
          {
            p: "We know that the healthcare sector is facing intense challenges. Per the 2024 AlixPartners Disruption Index, 74% of healthcare executives say disruption is so pervasive they don’t know where to allocate resources. Forty-two percent of healthcare companies surveyed by Healthcare IT Systems said they planned to increase their investments in AI revenue cycle management systems, and two-thirds plan to invest in AI technologies generally. Still, 30% said that uncertain return on investment was a barrier to investment in AI. Our experience supporting healthcare systems and other clinical operations bears this out."
          },
          {
            p: "Making changes to RCM can be a big undertaking. New processes must be designed or updated, vendors need to be vetted, and an improvement plan needs to be set. Disruption of the current system could have long-lasting ramifications."
          },
          {
            h: "Challenges and Investment in RCM"
          },
          {
            p: "As we will show below, it’s impossible to make successful changes to RCM without bridging financial, organizational, and digital assets."
          },
          {
            h: "Guardrails for RCM Optimization"
          },
          {
            p: "Don't overcomplicate it. Typically, companies come to us when they have an acute financial challenge in need of rapid relief. We help them focus on significant sources of leakage first—denials management, for example—to deliver results before tackling broader issues."
          },
          {
            p: "Take a clean-sheet view of organizations, processes, technology, and vendors. Design a purpose-built solution instead of trying to put Band-aids on a broken process. We help clients take the highest possible view, approaching the challenge from a board-level perspective in looking at how to define the problem … then fix it to better support care delivery, patient services, and corporate functions."
          },
          {
            p: "Take an end-to-end view of payor management. While emerging tools can help with solitary pieces of the revenue puzzle, they cannot simply be plugged in. Optimizing RCM means taking a top-down view that coordinates care delivery, information technology, revenue cycle, and finance functions, and plotting out a strategy to support efficient and effective charge entry, denials management, and resulting revenue and cash management."
          },
          {
            p: "Build a tailored solution. AI won't solve all your problems, but it is an important tool that can help enhance a solid process. AI programs can help rapidly clean data and improve insights without requiring a long-term vendor relationship. You need to invest in this space, but in the rush to upgrade the toolkit, companies need to look at their specific needs and find the right vendors, the right processes, and the right technologies, to invest at the right time to limit disruption."
          }
        ]

        , author: `Greg Magrisi,
Robert Chamberlain,
John Menton`,
        created_at: "July 22, 2024"

      }
    };

    // Simulate fetching data with a delay
    const fetchBlog = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setBlog(dummyData[id]);
    };

    fetchBlog();
  }, [id]);

  if (!blog) {
    return <div>Loading...</div>;
  }

  const headings = blog.data.filter(item => item.h);

  return (
    <div className="h-full overflow-y-auto bg-no-repeat bg-cover" style={{ backgroundSize: '100%', backgroundPosition: 'center top 000px' }}>
      <Header />
      <div className="flex flex-col sm:flex-row gap-x-5 mx-10 sm:mx-32 my-12 sm:my-36">
        <button
          className="sm:hidden fixed top-40 right-0 text-white  rounded-full font-poppins font-[700] mb-4 z-50"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <span>
            <svg width="88" height="112" viewBox="0 0 88 112" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g filter="url(#filter0_di_2326_48638)">
                <path d="M24 40C24 22.3269 38.3269 8 56 8C73.6731 8 88 22.3269 88 40V72H56C38.3269 72 24 57.6731 24 40Z" fill="#0048FF" shape-rendering="crispEdges" />
                <g clip-path="url(#clip0_2326_48638)">
                  <path d="M62.5376 31.4483L62.0472 31.5461C62.0133 31.3762 62.0307 31.2 62.097 31.0399C62.1634 30.8799 62.2758 30.7431 62.4199 30.647L62.6973 31.063L62.42 30.647C62.564 30.5509 62.7333 30.4998 62.9064 30.5M62.5376 31.4483L64.7131 31.9941C64.8355 31.8717 64.9189 31.7159 64.9528 31.5461L64.4624 31.4483L64.9528 31.5461C64.9867 31.3762 64.9693 31.2 64.903 31.0399C64.8366 30.8799 64.7242 30.7431 64.5801 30.647L64.3027 31.063C64.2409 31.0218 64.1683 30.9999 64.094 31V30.5H64.0936H62.9064M62.5376 31.4483L62.0472 31.5461M62.5376 31.4483L62.0472 31.5461M62.9064 30.5C62.9066 30.5 62.9067 30.5 62.9069 30.5L62.906 31V30.5H62.9064ZM62.0472 31.5461C62.0811 31.7159 62.1645 31.8717 62.2869 31.9941L62.0472 31.5461ZM45.5 44H45V44.5V47.5C45 48.0304 45.2107 48.5391 45.5858 48.9142C45.9609 49.2893 46.4696 49.5 47 49.5H65C65.5304 49.5 66.0391 49.2893 66.4142 48.9142C66.7893 48.5391 67 48.0304 67 47.5V44.5V44H66.5H45.5ZM64.1195 32.5876L64.7126 31.9945L64.1195 32.5876ZM66.5 43.5H67V43V40C67 39.4696 66.7893 38.9609 66.4142 38.5858C66.0391 38.2107 65.5304 38 65 38H47C46.4696 38 45.9609 38.2107 45.5858 38.5858C45.2107 38.9609 45 39.4696 45 40V43V43.5H45.5H66.5ZM45.0126 29.0126C45.3408 28.6844 45.7859 28.5 46.25 28.5H65.75C66.2141 28.5 66.6592 28.6844 66.9874 29.0126C67.3156 29.3408 67.5 29.7859 67.5 30.25V33.25C67.5 33.7141 67.3156 34.1592 66.9874 34.4874C66.6592 34.8156 66.2141 35 65.75 35H46.25C45.7859 35 45.3408 34.8156 45.0126 34.4874C44.6844 34.1592 44.5 33.7141 44.5 33.25V30.25C44.5 29.7859 44.6844 29.3408 45.0126 29.0126ZM52.25 30.5H47.75C47.4185 30.5 47.1005 30.6317 46.8661 30.8661C46.6317 31.1005 46.5 31.4185 46.5 31.75C46.5 32.0815 46.6317 32.3995 46.8661 32.6339C47.1005 32.8683 47.4185 33 47.75 33H52.25C52.5815 33 52.8995 32.8683 53.1339 32.6339C53.3683 32.3995 53.5 32.0815 53.5 31.75C53.5 31.4185 53.3683 31.1005 53.1339 30.8661C52.8995 30.6317 52.5815 30.5 52.25 30.5ZM62.2874 31.9945L62.8805 32.5876L62.2874 31.9945ZM63.8354 32.7779C63.9415 32.7338 64.0379 32.6693 64.1191 32.5881H62.8809C62.9621 32.6693 63.0585 32.7338 63.1646 32.7779C63.2709 32.822 63.3849 32.8447 63.5 32.8447C63.6151 32.8447 63.7291 32.822 63.8354 32.7779ZM44.5 40C44.5 39.337 44.7634 38.7011 45.2322 38.2322C45.7011 37.7634 46.337 37.5 47 37.5H65C65.663 37.5 66.2989 37.7634 66.7678 38.2322C67.2366 38.7011 67.5 39.337 67.5 40V47.5C67.5 48.163 67.2366 48.7989 66.7678 49.2678C66.2989 49.7366 65.663 50 65 50H47C46.337 50 45.7011 49.7366 45.2322 49.2678C44.7634 48.7989 44.5 48.163 44.5 47.5V40ZM47.5 40.75C47.5 40.6837 47.5263 40.6201 47.5732 40.5732C47.6201 40.5263 47.6837 40.5 47.75 40.5H61.25C61.3163 40.5 61.3799 40.5263 61.4268 40.5732C61.4737 40.6201 61.5 40.6837 61.5 40.75C61.5 40.8163 61.4737 40.8799 61.4268 40.9268C61.3799 40.9737 61.3163 41 61.25 41H47.75C47.6837 41 47.6201 40.9737 47.5732 40.9268C47.5263 40.8799 47.5 40.8163 47.5 40.75ZM47.5 46.75C47.5 46.6837 47.5263 46.6201 47.5732 46.5732C47.6201 46.5263 47.6837 46.5 47.75 46.5H56.75C56.8163 46.5 56.8799 46.5263 56.9268 46.5732C56.9737 46.6201 57 46.6837 57 46.75C57 46.8163 56.9737 46.8799 56.9268 46.9268C56.8799 46.9737 56.8163 47 56.75 47H47.75C47.6837 47 47.6201 46.9737 47.5732 46.9268C47.5263 46.8799 47.5 46.8163 47.5 46.75Z" stroke="#EBEDF0" />
                </g>
              </g>
              <defs>
                <filter id="filter0_di_2326_48638" x="0.6" y="0.6" width="110.8" height="110.8" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                  <feOffset dy="16" />
                  <feGaussianBlur stdDeviation="11.7" />
                  <feComposite in2="hardAlpha" operator="out" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.233333 0 0 0 0 1 0 0 0 0.3 0" />
                  <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2326_48638" />
                  <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2326_48638" result="shape" />
                  <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                  <feOffset />
                  <feGaussianBlur stdDeviation="2.55" />
                  <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                  <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0.5 0 0 0 0 1 0 0 0 1 0" />
                  <feBlend mode="normal" in2="shape" result="effect2_innerShadow_2326_48638" />
                </filter>
                <clipPath id="clip0_2326_48638">
                  <rect width="24" height="24" fill="white" transform="translate(44 28)" />
                </clipPath>
              </defs>
            </svg>

          </span>
        </button>
        <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 sm:hidden`}>
          <div className="bg-[#0B0C14] w-64 h-full p-4 absolute right-0">
            <button
              className="absolute top-4 right-4 text-white font-poppins font-[700] z-50"
              onClick={() => setIsSidebarOpen(false)}
            >
              <span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M2.25 12C2.25 6.61704 6.61704 2.25 12 2.25C17.383 2.25 21.75 6.61704 21.75 12C21.75 17.383 17.383 21.75 12 21.75C6.61704 21.75 2.25 17.383 2.25 12ZM12 3.75C7.44546 3.75 3.75 7.44546 3.75 12C3.75 16.5545 7.44546 20.25 12 20.25C16.5545 20.25 20.25 16.5545 20.25 12C20.25 7.44546 16.5545 3.75 12 3.75Z" fill="#EBEDF0" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M8.46967 8.46967C8.76256 8.17678 9.23744 8.17678 9.53033 8.46967L15.5303 14.4697C15.8232 14.7626 15.8232 15.2374 15.5303 15.5303C15.2374 15.8232 14.7626 15.8232 14.4697 15.5303L8.46967 9.53033C8.17678 9.23744 8.17678 8.76256 8.46967 8.46967Z" fill="#EBEDF0" />
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M15.5303 8.46967C15.8232 8.76256 15.8232 9.23744 15.5303 9.53033L9.53033 15.5303C9.23744 15.8232 8.76256 15.8232 8.46967 15.5303C8.17678 15.2374 8.17678 14.7626 8.46967 14.4697L14.4697 8.46967C14.7626 8.17678 15.2374 8.17678 15.5303 8.46967Z" fill="#EBEDF0" />
                </svg>

              </span>
            </button>
            <h2 className="text-white font-poppins font-[700]  mb-4">Table of Contents</h2>
            <ul className="text-[#6C9BE0] text-[16px] sm:text-[20px] max-w-full sm:max-w-[200px]">
              {headings.map((item, index) => (
                <li key={index} className="my-2">
                  <a href={`#heading-${index}`} className="hover:text-white" onClick={() => setIsSidebarOpen(false)}>{item.h}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="w-full sm:w-4/5">
          <div className='flex flex-col sm:flex-row justify-between mb-5'>
            <h1 className="text-[#EBEDF0] text-[32px] sm:text-[54px] max-w-full sm:max-w-[60%] font-[700] leading-[36px] sm:leading-[58px] mt-24 sm:mt-2 font-poppins">{blog.title}</h1>
            <div className='flex flex-col sm:flex-row items-center sm:mr-5 sm:mt-10'>
              {/* <img src='/demo_blog_img.png' className='w-[54px] h-[54px] sm:mr-5' alt="Author" /> */}
              <div className='text-center mt-10 sm:text-right'>
                <p className="text-[16px] sm:text-[16px] text-[#6C9BE0]">{blog.author}</p>
                <p className="text-[14px] sm:text-[16px] text-[#002FFF]">{blog.created_at}</p>
              </div>
            </div>
          </div>
          <img src={blog.header_image} className="w-full h-auto" alt="Header" />
          <div className="mt-6 text-[#6C9BE0]  text-[16px] sm:text-[20px]">
            {blog.data.map((item, index) => {
              if (item.img) {
                return (
                  <div key={index} className="flex flex-col sm:flex-row items-start my-4">
                    {blog.data[index - 1]?.p && <p id={`heading-${index - 1}`} className="mr-4 w-full sm:w-1/2 self-start">{blog.data[index - 1].p}</p>}
                    {blog.data[index - 1]?.h && <h2 id={`heading-${index - 1}`} className="mr-4 w-full sm:w-1/2 self-start">{blog.data[index - 1].h}</h2>}
                    <img src={item.img} alt="Content" className="w-full sm:w-1/2" />
                  </div>
                );
              }
              if (item.p) {
                return <p key={index} id={`heading-${index}`} className="my-4">{item.p}</p>;
              }
              if (item.h) {
                return <h2 key={index} id={`heading-${index}`} className="my-4 text-white font-poppins font-[700]">{item.h}</h2>;
              }
              return null;
            })}
          </div>
        </div>
        <div className="hidden sm:block w-full sm:w-1/5 pl-4 mt-8 sm:mt-0">
          <h2 className="text-white font-poppins font-[700] mb-4">Table of Contents</h2>
          <ul className="text-[#6C9BE0] text-[16px] sm:text-[20px] max-w-full sm:max-w-[200px]">
            {headings.map((item, index) => (
              <li key={index} className="my-2">
                <a href={`#heading-${index}`} className="hover:text-white">{item.h}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetail;