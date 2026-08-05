/**
 * Legal pages (/privacy and /terms). Kept apart from the marketing dictionary
 * because the two move for different reasons and at different times.
 *
 * Bullets are plain strings: the renderer bolds whatever comes before the first
 * " — ", so a bullet reads as `Term — explanation` without any markup here.
 */
const en = {
  updated: "5 August 2026",
  updatedLabel: "Last updated",
  backToHome: "Back to home",
  controllerHeading: "Who is responsible",
  controllerNameLabel: "Responsible",
  controllerEmailLabel: "Contact",
  controllerCountryLabel: "Country",

  privacy: {
    metaTitle: "Privacy Policy — Bikit",
    metaDescription: "What Bikit stores about you, why, and what you can do about it.",
    title: "Privacy Policy",
    intro: [
      "Bikit is a bike maintenance app run by one person, not a company. This policy explains what it stores about you, why it stores it, and what you can do about it.",
      "It covers bikit.app and the Bikit app installed on your device.",
    ],
    sections: [
      {
        heading: "What Bikit stores",
        body: [
          "Only what the app needs to work. Everything below is either something you typed in yourself or something a service you chose to connect sent back.",
        ],
        bullets: [
          "Account — your email address, your name if you gave one, and your preferences: language, distance unit and notification settings. Your password is stored as a salted hash and Bikit never sees it.",
          "Sign in with Google — if you use it, Google sends your name, your email address and a stable account identifier. Your Google password is never shared with Bikit.",
          "Your bikes — name, brand, model, year, type, colour, serial number, frame and wheel size, purchase date, warranty, photo and notes. Everything except the bike itself is optional.",
          "Your components and maintenance — category, brand, model, serial number, install date, the reminders you set, and every service, repair or replacement you log, with its date, notes and the mileage at the time.",
          "Usage totals — the kilometres and hours on each bike, either entered by you or synced from Strava.",
          "Strava, if you connect it — your athlete identifier, the tokens needed to sync, and for each ride matched to one of your bikes its activity identifier, distance and moving time. Bikit does not request or store routes, GPS traces, heart rate, power or anything else from a ride.",
          "Push notifications, if you turn them on — the address your browser assigns to that device, the encryption keys that belong to it, and the device's user agent.",
          "Payments, if you subscribe — your Stripe customer and subscription identifiers, your plan and its status. Card details never reach Bikit: payment happens on Stripe's own pages.",
          "Notification history — which maintenance alerts were sent and when, so the same alert is not sent to you twice.",
        ],
      },
      {
        heading: "What it is used for",
        body: [
          "To run the service you signed up for: keeping your bikes and their history, working out when a component is due for service, sending the alerts you asked for, and handling your subscription if you have one.",
          "That is the entire list. Bikit does not sell your data, does not share it for advertising, does not build advertising profiles, and carries no third-party analytics or tracking scripts of any kind.",
        ],
      },
      {
        heading: "Legal grounds",
        body: ["Under the GDPR, each use of your data rests on one of these:"],
        bullets: [
          "Performance of a contract — your account, your data and the core maintenance features. Without these there is no service.",
          "Consent — connecting Strava, turning on push notifications, and the optional weekly summary email. You can withdraw any of them at any time in Settings without affecting the rest.",
          "Legal obligation — keeping billing records for as long as tax law requires.",
          "Legitimate interest — keeping the service secure and preventing abuse.",
        ],
      },
      {
        heading: "Who else handles your data",
        body: [
          "Bikit runs on services that necessarily process some of your data on its behalf. Each is used for one purpose and nothing else:",
        ],
        bullets: [
          "Supabase — the database and the login system. This is where your data lives.",
          "Vercel — hosting and delivery of the site.",
          "Stripe — subscription payments, only if you subscribe.",
          "Resend — delivery of the emails Bikit sends you.",
          "Google — sign-in, only if you choose it.",
          "Strava — ride syncing, only if you connect it.",
          "Apple, Google and Mozilla push services — delivering push notifications to your device, only if you turn them on. They receive the encrypted notification and the device address, never your account.",
        ],
      },
      {
        heading: "Where your data is kept",
        body: [
          "The database is hosted in Ireland and your data stays in the European Union.",
          "Some of the services above are based outside the EU and may process data there. Where that happens it is covered by the safeguards those providers publish, such as the European Commission's standard contractual clauses.",
        ],
      },
      {
        heading: "How long it is kept",
        body: [
          "For as long as your account exists. Delete a bike, a component or a service in the app and it is removed from the database; delete your account and everything attached to it goes with it.",
          "Billing records held by Stripe are kept for as long as tax law requires, independently of your Bikit account.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask for a copy of your data, correct it, delete it, have it sent elsewhere, object to how it is used, or withdraw a consent you gave. Most of this you can do yourself in the app; for anything else, write to the address above and you will have an answer within 30 days.",
          "If you believe your data has been mishandled you can complain to the Portuguese data protection authority (CNPD, at cnpd.pt) or to the equivalent authority where you live.",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "Bikit sets two cookies and neither is for tracking: the session cookie that keeps you logged in, and one that remembers which language you picked on the homepage. Your light or dark theme preference is kept in your browser's own storage and never sent anywhere. There are no advertising or analytics cookies.",
        ],
      },
      {
        heading: "Children",
        body: [
          "Bikit is not intended for children under 16, and accounts should not be created for them.",
        ],
      },
      {
        heading: "Changes to this policy",
        body: [
          "If this policy changes, the date at the top changes with it. Where a change materially affects you, you will be told by email before it takes effect.",
        ],
      },
    ],
  },

  terms: {
    metaTitle: "Terms of Service — Bikit",
    metaDescription: "The agreement between you and Bikit.",
    title: "Terms of Service",
    intro: [
      "These terms are the agreement between you and the person who runs Bikit. Using the app means accepting them.",
    ],
    sections: [
      {
        heading: "What Bikit is",
        body: [
          "Bikit is a tool for recording your bikes, their components and their maintenance, and for reminding you when a service is due. It is a record-keeping and reminder tool, and nothing more than that.",
        ],
      },
      {
        heading: "Bikit does not inspect your bike",
        body: [
          "Every alert Bikit shows is arithmetic on numbers you provided: an interval you chose, measured against distance or time that you or Strava reported. It has no way of knowing the real condition of any part.",
          "A component can fail long before its interval is up, and a component past its interval may be perfectly fine. Do not treat a full green bar as a safety check. If a part matters to your safety — brakes, steering, frame, fork — have it inspected by someone qualified.",
        ],
      },
      {
        heading: "Your account",
        body: [
          "You need to be at least 16 to have an account. Keep your login to yourself: anything done through your account is treated as done by you. If you think someone else has got in, say so straight away.",
        ],
      },
      {
        heading: "Plans and payment",
        body: [
          "Bikit has a free plan and two paid plans: Personal at €2.99 per month and Pro at €7.99 per month. The price is always shown before you confirm.",
          "Paid plans renew every month until you cancel. Cancelling stops the next renewal and you keep the paid features until the end of the period you have already paid for. Payments are handled by Stripe; card details never reach Bikit.",
          "As a consumer in the EU you have 14 days to change your mind about a subscription. Ask within that window and you get your money back.",
        ],
      },
      {
        heading: "What you enter stays yours",
        body: [
          "The bikes, components, services and notes you record belong to you. Bikit stores them in order to show them back to you and claims no rights over them. You can delete them at any time, or ask for a copy.",
        ],
      },
      {
        heading: "What you may not do",
        body: ["Some things are off limits:"],
        bullets: [
          "Reaching for other people's accounts or data.",
          "Overloading, probing or disrupting the service.",
          "Reselling Bikit or passing it off as your own.",
          "Using it for anything unlawful.",
        ],
      },
      {
        heading: "Strava",
        body: [
          "Connecting Strava is optional and is also governed by Strava's own terms. Bikit reads the activities it needs to keep your mileage current, and nothing else. You can disconnect at any time in Settings; the data already in Bikit stays where it is.",
        ],
      },
      {
        heading: "Availability and liability",
        body: [
          "Bikit is a personal project run by one person. It is looked after with care, but it comes with no promise of uptime, no guaranteed response time and no warranty that it will be free of faults. Features may change or be withdrawn.",
          "Nothing here limits liability for death or personal injury caused by negligence, or for fraud — those cannot be excluded by law. Beyond that, and as far as the law allows, liability is limited to the amount you paid in the twelve months before the problem arose.",
        ],
      },
      {
        heading: "Ending it",
        body: [
          "You can delete your account whenever you want. An account may be suspended or closed if these terms are seriously or repeatedly broken; where it is reasonable to do so you will be told first and given a chance to put it right.",
        ],
      },
      {
        heading: "Changes to these terms",
        body: [
          "These terms may change. The date at the top changes with them, and material changes will be announced by email before they take effect. Carrying on using Bikit after that means accepting the new version.",
        ],
      },
      {
        heading: "Law and disputes",
        body: [
          "Portuguese law applies. This does not take away the protection given to you by the consumer law of the country where you live.",
          "If something goes wrong, write first — most things are settled that way. As a consumer you may also turn to the European Commission's online dispute resolution platform or to the alternative dispute resolution body for your area.",
        ],
      },
    ],
  },
};

export default en;
export type LegalDictionary = typeof en;
