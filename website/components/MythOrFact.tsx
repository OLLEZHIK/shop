"use client";

import { useState } from "react";
import { ArrowRightIcon, SparkleIcon } from "./icons";

interface Statement {
  claim: string;
  isFact: boolean;
  explanation: string;
}

// General, well-established pet-care knowledge - not claims about any
// business. Kept short so a round takes about a minute.
const STATEMENTS: Statement[] = [
  {
    claim: "A warm, dry nose means your dog is sick.",
    isFact: false,
    explanation:
      "Nose temperature and moisture change throughout the day in healthy dogs. Appetite, energy and behaviour are far better signals.",
  },
  {
    claim: "Chocolate is toxic to dogs.",
    isFact: true,
    explanation:
      "Chocolate contains theobromine, which dogs break down very slowly. Dark and baking chocolate are the most dangerous.",
  },
  {
    claim: "A saucer of milk is a good treat for an adult cat.",
    isFact: false,
    explanation:
      "Many adult cats are lactose intolerant, and milk can upset their stomach. Fresh water is all they need.",
  },
  {
    claim: "Grapes and raisins can be dangerous for dogs.",
    isFact: true,
    explanation: "They can cause kidney failure in some dogs, and there's no known safe amount. Keep them out of reach.",
  },
  {
    claim: "A wagging tail always means a happy dog.",
    isFact: false,
    explanation:
      "Wagging shows the dog is aroused or engaged - that can be excitement, but also nervousness. Read the whole body, not just the tail.",
  },
  {
    claim: "Cats always land on their feet, so falls from a balcony are harmless.",
    isFact: false,
    explanation:
      "Cats have a righting reflex, but falls from windows and balconies still injure many cats every year. Secure balconies with a net.",
  },
  {
    claim: "Indoor-only cats still benefit from vaccinations.",
    isFact: true,
    explanation:
      "Some viruses can travel in on shoes and clothes, and indoor cats still visit vets or boarding. Ask your vet which core vaccines fit.",
  },
];

type Answer = { choice: boolean; correct: boolean };

export function MythOrFact() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const finished = index >= STATEMENTS.length;
  const current = STATEMENTS[index];
  const answered = answers[index];
  const score = answers.filter((a) => a.correct).length;

  function choose(choice: boolean) {
    if (answered || !current) return;
    setAnswers((prev) => [...prev, { choice, correct: choice === current.isFact }]);
  }

  function restart() {
    setIndex(0);
    setAnswers([]);
  }

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-ink p-6 text-white md:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--brand-orange)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--cat-vet)" }}
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange">
            <SparkleIcon className="h-4 w-4" />
            Myth or fact?
          </p>
          <div className="flex gap-1.5" aria-label={`Question ${Math.min(index + 1, STATEMENTS.length)} of ${STATEMENTS.length}`}>
            {STATEMENTS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < answers.length
                    ? answers[i].correct
                      ? "w-5 bg-brand-green"
                      : "w-5 bg-brand-orange"
                    : i === index
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>

        {!finished && current && (
          <div key={index} className="rise-in mt-6 min-h-[15rem]">
            <p className="font-heading text-2xl font-bold leading-snug md:text-3xl">&ldquo;{current.claim}&rdquo;</p>

            {!answered ? (
              <div className="mt-8 grid grid-cols-2 gap-3 sm:max-w-sm">
                <button
                  type="button"
                  onClick={() => choose(false)}
                  className="min-h-12 rounded-[var(--radius-control)] bg-white/10 px-5 py-3 font-semibold transition hover:bg-white/20"
                >
                  Myth
                </button>
                <button
                  type="button"
                  onClick={() => choose(true)}
                  className="min-h-12 rounded-[var(--radius-control)] bg-brand-orange px-5 py-3 font-semibold transition hover:bg-brand-orange-deep"
                >
                  Fact
                </button>
              </div>
            ) : (
              <div className="rise-in mt-6" aria-live="polite">
                <p className={`text-sm font-semibold ${answered.correct ? "text-brand-green" : "text-brand-orange"}`}>
                  {answered.correct ? "Correct!" : "Not quite."} It&apos;s a {current.isFact ? "fact" : "myth"}.
                </p>
                <p className="mt-2 max-w-xl text-white/75">{current.explanation}</p>
                <button
                  type="button"
                  onClick={() => setIndex((i) => i + 1)}
                  className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-white px-5 py-2.5 font-semibold text-ink transition hover:bg-brand-orange hover:text-white"
                >
                  {index === STATEMENTS.length - 1 ? "See my score" : "Next question"}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {finished && (
          <div className="rise-in mt-6 min-h-[15rem]" aria-live="polite">
            <p className="font-heading text-5xl font-extrabold md:text-6xl">
              {score}
              <span className="text-white/40">/{STATEMENTS.length}</span>
            </p>
            <p className="mt-3 text-xl font-semibold">
              {score === STATEMENTS.length
                ? "Perfect score - your pet is in great hands."
                : score >= STATEMENTS.length - 2
                  ? "Nicely done - you know your stuff."
                  : "A few surprises there - now you know!"}
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-pill)] bg-white px-5 py-2.5 font-semibold text-ink transition hover:bg-brand-orange hover:text-white"
            >
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
