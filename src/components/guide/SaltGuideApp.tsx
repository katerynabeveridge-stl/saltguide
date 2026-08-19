"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  GUIDE_PATH,
  guidePageFromPathname,
  type GuidePageId,
} from "../../lib/guide/paths";
import { EMPTY_GUIDE_DATA } from "../../lib/guide/queries";
import type { GuideData } from "../../lib/guide/types";
import { useGuideData } from "../../lib/guide/useGuideData";
import GuideFooter from "./GuideFooter";
import HomeLanding from "./HomeLanding";
import PlacesDirectory from "./PlacesDirectory";
import WhatsOnFeed from "./WhatsOnFeed";

type Props = {
  data?: GuideData;
  initialPage?: GuidePageId;
};

const NAV: [GuidePageId, string][] = [
  ["whatson", "What's On"],
  ["places", "Places"],
  ["about", "About"],
];

export default function SaltGuideApp({
  data: initialData = EMPTY_GUIDE_DATA,
  initialPage = "home",
}: Props) {
  const pathname = usePathname();
  const page = guidePageFromPathname(pathname) ?? initialPage;
  const { data, loading } = useGuideData(initialData);
  const { venues, links, events } = data;

  const needsList = page === "home" || page === "whatson" || page === "places";
  const showLoading = loading && needsList;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className={page === "whatson" ? "sg-wrap sg-whatson" : "sg-wrap"}>
      <header className="sg-header">
        <div className="sg-header-top">
          <Link href={GUIDE_PATH.home} className="sg-brand">
            SALT<mark>GUIDE</mark>
          </Link>
          <nav className="sg-nav" aria-label="Main">
            {NAV.map(([k, label]) => (
              <Link
                key={k}
                href={GUIDE_PATH[k]}
                className={page === k ? "on" : ""}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        {page === "whatson" ? (
          <>
            <h1 className="sg-h1">
              What&apos;s <span className="hl">On</span>.
            </h1>
            <p className="sg-lede">
              This week and beyond in Hastings &amp; St Leonards.
            </p>
          </>
        ) : null}
        {page === "places" ? (
          <>
            <h1 className="sg-h1">Places.</h1>
            <p className="sg-lede">
              A guide to Hastings &amp; St Leonards.
            </p>
          </>
        ) : null}
        {page === "about" ? <h1 className="sg-h1">About.</h1> : null}
        {page === "privacy" ? (
          <h1 className="sg-h1">Privacy Policy</h1>
        ) : null}
        {page === "terms" ? <h1 className="sg-h1">Terms of Use</h1> : null}
      </header>

      {showLoading ? (
        <div className="sg-empty" role="status" aria-live="polite">
          Loading…
        </div>
      ) : null}

      {page === "home" && !showLoading ? (
        <HomeLanding events={events} venues={venues} links={links} />
      ) : null}

      {page === "whatson" && !showLoading ? (
        <WhatsOnFeed events={events} />
      ) : null}

      {page === "places" && !showLoading ? (
        <PlacesDirectory venues={venues} links={links} />
      ) : null}

      {page === "about" ? (
        <div className="sg-policy">
          <p>
            Salt Guide is made in Hastings and St Leonards by people who live here.
          </p>
          <p>
            It started with founder Kat, a mum of two who could never keep track
            of what was on. Pebbles List came first for families, Salt Guide
            followed for everything else.
          </p>
          <p>
            Today it is two platforms, a Sunday newsletter, and a growing team,
            all pointed at the same thing: championing local businesses and
            making it easy to discover what is happening on your doorstep.
          </p>
          <p>
            If you have something to feature or an idea to partner on,{" "}
            <a href="mailto:hello@saltguide.co.uk">get in touch</a>.
          </p>
        </div>
      ) : null}

      {page === "privacy" ? (
        <div className="sg-policy">
          <p>
            <strong>
              <time dateTime="2026-08-19">Last updated: 19 August 2026</time>
            </strong>
          </p>
          <p>
            Salt Guide is a local guide and newsletter covering Hastings and St
            Leonards.
          </p>
          <p>
            This privacy policy explains what personal information we collect,
            why we collect it, and how we use it.
          </p>
          <p>
            If you have any questions about your personal information, or want
            to exercise any of your rights, you can contact us at{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a>.
          </p>

          <h2>Who is responsible for your data</h2>
          <p>
            Kat Beveridge, operating Salt Guide, is responsible for the personal
            information described in this policy.
          </p>
          <p>
            Contact:{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a>
          </p>

          <h2>What we collect and why</h2>

          <h3>Newsletter subscribers</h3>
          <p>
            If you sign up for the Salt Guide newsletter, we collect your email
            address and any name you choose to provide.
          </p>
          <p>
            We use this information to send you the newsletter and related Salt
            Guide emails.
          </p>
          <p>
            Our legal basis is consent. You can withdraw your consent at any
            time by using the unsubscribe link in our emails.
          </p>

          <h3>Event, place and business submissions</h3>
          <p>
            If you send us information about an event, venue, business or place
            through our website, email, Instagram or WhatsApp, we collect the
            information you choose to provide.
          </p>
          <p>
            This may include your name and contact details where you provide
            them, as well as information about the event or business.
          </p>
          <p>
            We use this information to research, check and maintain listings on
            Salt Guide and to contact you if we need to clarify something.
          </p>
          <p>
            Our legal basis is legitimate interests, specifically running and
            maintaining an accurate local guide.
          </p>

          <h3>Enquiries and messages</h3>
          <p>
            If you email us or contact us through social media, we may keep the
            correspondence so that we can respond to you and keep track of the
            conversation.
          </p>

          <h3>Website usage</h3>
          <p>
            Our website is hosted and delivered using Cloudflare. Cloudflare may
            process technical information such as IP addresses, browser
            information and information about requests made to our website in
            order to provide and secure the service.
          </p>
          <p>
            We do not currently use Google Analytics or other third-party
            analytics tools to track how you use the website.
          </p>

          <h2>Information about businesses and events</h2>
          <p>
            Salt Guide includes information about events, venues, businesses and
            other places in and around Hastings and St Leonards.
          </p>
          <p>
            We may compile listings from publicly available sources, including
            business websites, social media, press releases, printed listings
            and other public information, as well as information sent to us
            directly.
          </p>
          <p>
            Where a listing includes personal information about an identifiable
            individual, such as a performer, organiser or sole trader, we use
            that information where we have a legitimate interest in providing an
            accurate and useful local guide.
          </p>
          <p>
            If you are named in a listing and believe the information is
            inaccurate or should be removed, please contact us at{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a>.
          </p>

          <h2>Who we share information with</h2>
          <p>
            We do not sell your personal information or share it with other
            organisations for their own marketing.
          </p>
          <p>
            We use a small number of service providers to help us operate Salt
            Guide, including:
          </p>
          <ul>
            <li>
              Substack, which hosts our newsletter and processes subscriber
              information.
            </li>
            <li>
              Supabase, which provides database services for our website.
            </li>
            <li>
              Cloudflare, which provides website hosting, delivery and security
              services.
            </li>
            <li>
              Instagram and WhatsApp, where you choose to contact us through
              those platforms.
            </li>
          </ul>
          <p>
            These providers may process information outside the UK. Where this
            happens, appropriate safeguards are used where required by data
            protection law. The providers&apos; own privacy policies also apply
            to their processing of your information.
          </p>
          <p>
            We may also disclose personal information where we are legally
            required to do so.
          </p>

          <h2>How long we keep information</h2>
          <p>
            We keep newsletter subscriber information until you unsubscribe.
          </p>
          <p>
            We keep submissions and correspondence for as long as reasonably
            necessary to operate Salt Guide, maintain accurate listings and keep
            appropriate records. We review information periodically and delete
            information that we no longer need.
          </p>

          <h2>Your rights</h2>
          <p>Under UK data protection law, you may have the right to:</p>
          <ul>
            <li>
              ask for a copy of the personal information we hold about you;
            </li>
            <li>ask us to correct inaccurate or incomplete information;</li>
            <li>
              ask us to delete your information in certain circumstances;
            </li>
            <li>
              ask us to restrict how we use your information in certain
              circumstances;
            </li>
            <li>object to certain uses of your information; and</li>
            <li>
              withdraw your consent where we rely on consent to process your
              information.
            </li>
          </ul>
          <p>
            You can make a request by emailing{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a>.
          </p>
          <p>We will normally respond within one month.</p>

          <h2>Complaints</h2>
          <p>
            If you have concerns about how we have used your personal
            information, please contact us first at{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a> so
            that we can try to resolve the issue.
          </p>
          <p>
            You also have the right to complain to the Information
            Commissioner&apos;s Office (ICO), the UK&apos;s data protection
            regulator.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this privacy policy from time to time. The date at the
            top of this page shows when it was last updated.
          </p>
        </div>
      ) : null}

      {page === "terms" ? (
        <div className="sg-policy">
          <p>
            <strong>
              <time dateTime="2026-08-19">Last updated: 19 August 2026</time>
            </strong>
          </p>
          <p>
            Salt Guide is a local guide and newsletter covering Hastings and St
            Leonards, operated by <strong>Kat Beveridge</strong>.
          </p>
          <p>
            By using the Salt Guide website or subscribing to our newsletter,
            you agree to these terms.
          </p>
          <p>
            If you have any questions, please email{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a>.
          </p>

          <h2>About our listings</h2>
          <p>
            We compile listings from publicly available sources, including venue
            websites, social media, printed listings and press releases, as well
            as information sent to us directly by organisers, venues, businesses
            and readers.
          </p>
          <p>
            We check information where we can, but we are a small independent
            publication and cannot guarantee that every detail is complete or up
            to date. Dates, times, prices, age restrictions, accessibility
            information and other details can change, and events can be
            cancelled or changed at short notice.
          </p>
          <p>
            <strong>
              Always check directly with the venue or organiser before travelling
              or spending money.
            </strong>{" "}
            Their own website or other official communication should be treated
            as the definitive source of information.
          </p>

          <h2>What we are not responsible for</h2>
          <p>
            Salt Guide does not organise, run or host the events we list, and we
            do not generally sell tickets for them.
          </p>
          <p>We are not responsible for:</p>
          <ul>
            <li>
              events being cancelled, rescheduled, moved or sold out;
            </li>
            <li>
              information in a listing becoming inaccurate or out of date;
            </li>
            <li>
              the quality, safety, accessibility or conduct of an event, venue or
              business;
            </li>
            <li>
              anything that happens to you when attending an event or visiting a
              venue; or
            </li>
            <li>
              the content, availability, accuracy or security of third-party
              websites that we link to.
            </li>
          </ul>
          <p>
            <strong>
              We do not exclude or limit any liability where the law does not
              allow us to do so.
            </strong>
          </p>

          <h2>Inclusion is not endorsement</h2>
          <p>
            A listing on Salt Guide means that we think something may be of
            interest to people in the local area. It does not necessarily mean
            that we have visited, personally vetted, approved or recommended it.
          </p>
          <p>
            Where we express an opinion, including in a guide or review, that is
            our editorial view at the time of publication. Circumstances and
            experiences can change, and an editorial opinion is not a guarantee
            of your experience.
          </p>

          <h2>Partnerships, advertising and affiliates</h2>
          <p>
            We are not affiliated with, sponsored by or in partnership with a
            venue, business, event or organiser unless this is clearly stated.
          </p>
          <p>
            Where content is paid for, sponsored, gifted or forms part of a
            commercial arrangement, we will make this clear.
          </p>
          <p>
            Where content is independent editorial, we will not present it as
            paid or sponsored content.
          </p>
          <p>
            Where we use affiliate links, we will make this clear where
            appropriate. If you make a purchase through an affiliate link, we
            may receive a commission at no additional cost to you.
          </p>

          <h2>Submitting listings</h2>
          <p>
            If you send us an event, venue, business or other information to
            consider for inclusion, you confirm that:
          </p>
          <ul>
            <li>
              you have the right to provide the information and any images you
              send us; and
            </li>
            <li>
              to the best of your knowledge, the information you provide is
              accurate.
            </li>
          </ul>
          <p>
            We decide what to publish and are not obliged to publish every
            submission.
          </p>
          <p>
            We may edit submissions for length, clarity, accuracy and house
            style. We may also decline or remove a listing at any time.
          </p>
          <p>
            Sending us a submission does not create a partnership, agency or
            other commercial relationship between you and Salt Guide.
          </p>

          <h2>Corrections and removals</h2>
          <p>
            If you believe something we have published about you, your business,
            venue or event is inaccurate, or you would like a listing to be
            removed, please contact us at{" "}
            <a href="mailto:hello@saltguide.co.uk">hello@saltguide.co.uk</a>.
          </p>
          <p>
            We will consider requests and, where appropriate, correct or remove
            information promptly.
          </p>

          <h2>Our content</h2>
          <p>
            The writing, guides, photographs, illustrations and design created
            for Salt Guide belong to Salt Guide unless otherwise stated or
            credited to someone else.
          </p>
          <p>
            You are welcome to link to Salt Guide and to quote short extracts
            with appropriate credit.
          </p>
          <p>
            Please do not reproduce or republish our content in full without our
            permission.
          </p>
          <p>
            Nothing in these terms prevents you from using or sharing content
            where you have a separate legal right to do so.
          </p>

          <h2>Third-party links</h2>
          <p>
            Salt Guide may link to websites, booking platforms and social media
            accounts operated by other organisations.
          </p>
          <p>
            These links are provided for convenience and information. We do not
            control those websites and are not responsible for their content,
            availability, security or privacy practices.
          </p>
          <p>
            Your use of third-party websites is subject to their own terms and
            policies.
          </p>

          <h2>Changes to these terms</h2>
          <p>
            We may update these terms from time to time. The date at the top of
            this page shows when they were last updated.
          </p>
        </div>
      ) : null}

      <GuideFooter />
    </div>
  );
}
