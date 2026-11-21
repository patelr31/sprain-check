// Ottawa Ankle, Foot and Knee Rules: decision rules clinicians use to decide who needs an X-ray.
// Ankle/foot: Stiell IG et al., JAMA 1993. Pooled accuracy: Bachmann LM et al., BMJ 2003;326:417
//   (27 studies, 15,581 patients): sensitivity 97.6%, specificity 31.5%.
// Knee: Stiell IG et al., JAMA 1996. Pooled accuracy: Bachmann LM et al., Ann Intern Med 2004;140:121
//   (6 studies, 4,249 adults): sensitivity 98.5%, specificity 48.6%.
// The rules were built for a clinician's exam. Here they guide a self-check, so the page says so.

const EVIDENCE = {
  ankle: { sens: 97.6, spec: 31.5, cite: "Bachmann et al., BMJ 2003 (15,581 patients)", url: "https://pubmed.ncbi.nlm.nih.gov/12595378/" },
  knee: { sens: 98.5, spec: 48.6, cite: "Bachmann et al., Ann Intern Med 2004 (4,249 adults)", url: "https://pubmed.ncbi.nlm.nih.gov/14734335/" },
};

// Go to emergency care now, whatever the rules say.
const RED_FLAGS = [
  "Bone showing, or an open wound over the injury",
  "The ankle, foot or knee looks bent or out of place",
  "The foot or toes are cold, pale, blue, numb or tingling, or you can't move your toes",
  "It happened in a high-energy accident (car or bike crash, fall from a height)",
  "Pain is severe and getting worse despite rest and pain relief",
  "Swelling is spreading fast, especially if you take a blood thinner",
];

// When the rules weren't designed to apply: see a clinician instead of relying on this check.
const NOT_FOR = {
  ankle: [
    "Younger than 18 (the rules are less certain in children)",
    "More than 10 days since the injury",
    "Drunk or high, or with a head injury or other injuries at the same time",
    "Reduced feeling in the feet (for example diabetic neuropathy)",
    "Pregnant",
  ],
  knee: [
    "Younger than 18 (the rules are less certain in children)",
    "More than 7 days since the injury",
    "Drunk or high, or with a head injury or other injuries at the same time",
    "Reduced feeling in the legs, or paralysis",
    "Pregnant",
  ],
};

// Each rule question: id, text, what a "yes" means. `zone` limits ankle/foot questions.
const QUESTIONS = {
  ankle: [
    { id: "malleolar", type: "zone", text: "Is the pain around the ankle bones (the bony bumps on either side of the ankle)?" },
    { id: "midfoot", type: "zone", text: "Is the pain in the middle of the foot (between the ankle and the toes)?" },
    { id: "A", zone: "malleolar", text: "Press along the back edge and tip of the OUTER ankle bone, over the lowest 6 cm (about 3 finger-widths). Is it tender on the bone?", point: "A" },
    { id: "B", zone: "malleolar", text: "Press along the back edge and tip of the INNER ankle bone, over the lowest 6 cm. Is it tender on the bone?", point: "B" },
    { id: "C", zone: "midfoot", text: "Press the bony bump on the OUTER edge of the foot, halfway along (base of the 5th metatarsal). Is it tender?", point: "C" },
    { id: "D", zone: "midfoot", text: "Press the bony bump on the INNER side of the midfoot, in front of the ankle (the navicular). Is it tender?", point: "D" },
    { id: "walk", zone: "any", text: "Were you unable to take 4 steps (limping is fine) both right after the injury AND now?" },
  ],
  knee: [
    { id: "age55", text: "Are you 55 or older?" },
    { id: "patella", text: "Is the kneecap itself tender to press, with no other bone in the knee tender?", point: "P" },
    { id: "fibula", text: "Is the bony bump on the OUTER side of the leg, just below the knee (head of the fibula), tender to press?", point: "F" },
    { id: "flex", text: "Can you NOT bend the knee to a right angle (90 degrees)?" },
    { id: "walk", text: "Were you unable to take 4 steps (limping is fine) both right after the injury AND now?" },
  ],
};
