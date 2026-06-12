import { useState, useEffect } from "react";

const COLORS = {
  blush: "#F2E4E4",
  rose: "#9B5A6A",
  roseDark: "#7A3F50",
  roseLight: "#C48A9A",
  cream: "#FDF7F7",
  text: "#3D2229",
  muted: "#A07080",
  white: "#FFFFFF",
  accent: "#E8C8CE",
};

const STORAGE_KEY = "bloom_again_v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const today = new Date().toISOString().split("T")[0];
const thisWeek = (() => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split("T")[0];
})();
const thisMonth = new Date().toISOString().slice(0, 7);

const AFFIRMATIONS = [
  "I am worthy of healing.",
  "Your soul is beautiful.",
  "You are not broken — you are becoming.",
  "Growth is happening, even in the quiet.",
  "I choose myself, today and always.",
];

const todayAffirmation = AFFIRMATIONS[new Date().getDay() % AFFIRMATIONS.length];

// ─── Shared UI ───────────────────────────────────────────────────────────────

function TextArea({ value, onChange, placeholder, rows = 4, style = {} }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        borderBottom: `1px solid ${COLORS.accent}`,
        outline: "none",
        fontFamily: "Georgia, serif",
        fontSize: 14,
        color: COLORS.text,
        resize: "none",
        lineHeight: 1.9,
        padding: "6px 0",
        marginBottom: 8,
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}

function SectionCard({ title, subtitle, children, accent = false }) {
  return (
    <div
      style={{
        background: accent ? COLORS.blush : COLORS.white,
        borderRadius: 16,
        padding: "24px 20px",
        marginBottom: 20,
        boxShadow: "0 2px 12px rgba(155,90,106,0.08)",
      }}
    >
      {title && (
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: COLORS.muted, textTransform: "uppercase", marginBottom: 4 }}>
            {subtitle}
          </div>
          <div
            style={{
              fontFamily: "'Georgia', serif",
              fontSize: 20,
              color: COLORS.roseDark,
              fontStyle: "italic",
              marginBottom: 14,
              borderBottom: `1px solid ${COLORS.accent}`,
              paddingBottom: 10,
            }}
          >
            {title}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

function Label({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.5,
        color: COLORS.rose,
        textTransform: "uppercase",
        marginBottom: 6,
        marginTop: 16,
      }}
    >
      {children}
    </div>
  );
}

function SaveButton({ onSave, saved }) {
  return (
    <button
      onClick={onSave}
      style={{
        background: saved ? COLORS.accent : COLORS.rose,
        color: saved ? COLORS.roseDark : COLORS.white,
        border: "none",
        borderRadius: 24,
        padding: "10px 28px",
        fontFamily: "Georgia, serif",
        fontStyle: "italic",
        fontSize: 14,
        cursor: "pointer",
        display: "block",
        margin: "20px auto 0",
        transition: "all 0.2s",
      }}
    >
      {saved ? "✓ Saved" : "Save Entry"}
    </button>
  );
}

// ─── Daily Section ────────────────────────────────────────────────────────────

function DailySection({ data, setData }) {
  const key = `daily_${today}`;
  const entry = data[key] || {};
  const [saved, setSaved] = useState(false);

  function update(field, val) {
    setData((prev) => ({ ...prev, [key]: { ...entry, [field]: val } }));
    setSaved(false);
  }

  function updateGratitude(i, val) {
    const g = [...(entry.gratitude || ["", "", ""])];
    g[i] = val;
    update("gratitude", g);
  }

  function updateChecklist(i, field, val) {
    const c = [...(entry.checklist || Array(6).fill({ text: "", done: false }))];
    c[i] = { ...c[i], [field]: val };
    update("checklist", c);
  }

  function handleSave() {
    setSaved(true);
    saveData(data);
  }

  const gratitude = entry.gratitude || ["", "", ""];
  const checklist = entry.checklist || Array(6).fill({ text: "", done: false });

  return (
    <div>
      <div
        style={{
          textAlign: "center",
          padding: "20px 0 12px",
          color: COLORS.muted,
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          fontSize: 13,
          letterSpacing: 0.5,
        }}
      >
        {todayAffirmation}
      </div>

      <SectionCard title="Daily Recap" subtitle="Today's narrative" accent>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
          What happened today? What did you feel? What did you learn?
        </div>
        <TextArea
          value={entry.recap || ""}
          onChange={(v) => update("recap", v)}
          placeholder="Write freely here..."
          rows={6}
        />
      </SectionCard>

      <SectionCard title="Gratitude" subtitle="3 things">
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>
          Name three things you're grateful for, however small.
        </div>
        {gratitude.map((g, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
            <span style={{ color: COLORS.rose, fontFamily: "Georgia,serif", fontStyle: "italic", marginTop: 6, minWidth: 20 }}>
              {i + 1}.
            </span>
            <TextArea value={g} onChange={(v) => updateGratitude(i, v)} placeholder={`Gratitude ${i + 1}`} rows={1} />
          </div>
        ))}
      </SectionCard>

      <SectionCard title="Proof of My Wins" subtitle="Evidence" accent>
        <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 8 }}>
          Write evidence of your capability today. Fight the inner critic with facts.
        </div>
        <TextArea
          value={entry.wins || ""}
          onChange={(v) => update("wins", v)}
          placeholder="Today I showed up by..."
          rows={4}
        />
      </SectionCard>

      <SectionCard title="Checklist" subtitle="Today's intentions">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px 16px",
          }}
        >
          {checklist.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div
                onClick={() => updateChecklist(i, "done", !item.done)}
                style={{
                  width: 16,
                  height: 16,
                  border: `2px solid ${item.done ? COLORS.rose : COLORS.accent}`,
                  borderRadius: 4,
                  background: item.done ? COLORS.rose : "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.done && <span style={{ color: "white", fontSize: 10 }}>✓</span>}
              </div>
              <input
                value={item.text}
                onChange={(e) => updateChecklist(i, "text", e.target.value)}
                placeholder={`Task ${i + 1}`}
                style={{
                  border: "none",
                  borderBottom: `1px solid ${COLORS.accent}`,
                  outline: "none",
                  fontFamily: "Georgia, serif",
                  fontSize: 13,
                  color: item.done ? COLORS.muted : COLORS.text,
                  textDecoration: item.done ? "line-through" : "none",
                  background: "transparent",
                  width: "100%",
                  padding: "3px 0",
                }}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SaveButton onSave={handleSave} saved={saved} />
    </div>
  );
}

// ─── Weekly + Monthly Section ─────────────────────────────────────────────────

function WeeklyMonthlySection({ data, setData }) {
  const wKey = `weekly_${thisWeek}`;
  const mKey = `monthly_${thisMonth}`;
  const wEntry = data[wKey] || {};
  const mEntry = data[mKey] || {};
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("weekly");

  function updateW(field, val) {
    setData((prev) => ({ ...prev, [wKey]: { ...wEntry, [field]: val } }));
    setSaved(false);
  }

  function updateM(field, val) {
    setData((prev) => ({ ...prev, [mKey]: { ...mEntry, [field]: val } }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    saveData(data);
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.accent}` }}>
        {["weekly", "monthly"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "12px 0",
              background: tab === t ? COLORS.rose : "transparent",
              color: tab === t ? COLORS.white : COLORS.muted,
              border: "none",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: 15,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t === "weekly" ? "Weekly Review" : "Monthly Check-In"}
          </button>
        ))}
      </div>

      {tab === "weekly" && (
        <>
          <SectionCard title="Progress Check" subtitle="This week" accent>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>What's Working</Label>
                <TextArea
                  value={wEntry.working || ""}
                  onChange={(v) => updateW("working", v)}
                  placeholder="What felt good this week?"
                  rows={4}
                />
              </div>
              <div>
                <Label>What's Not Working</Label>
                <TextArea
                  value={wEntry.notWorking || ""}
                  onChange={(v) => updateW("notWorking", v)}
                  placeholder="What needs to change?"
                  rows={4}
                />
              </div>
            </div>
            <Label>Patterns I Noticed</Label>
            <TextArea
              value={wEntry.patterns || ""}
              onChange={(v) => updateW("patterns", v)}
              placeholder="Any repeating thoughts, behaviors, or feelings this week?"
              rows={3}
            />
            <Label>What I'll Do Differently</Label>
            <TextArea
              value={wEntry.different || ""}
              onChange={(v) => updateW("different", v)}
              placeholder="One thing I'm adjusting next week..."
              rows={3}
            />
          </SectionCard>
        </>
      )}

      {tab === "monthly" && (
        <>
          <SectionCard title="Monthly SWOT" subtitle="Honest check-in" accent>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>
              Write the real version — not the acceptable one.
            </div>
            {[
              { key: "strengths", label: "Strengths", prompt: "What worked? What came naturally?" },
              { key: "weaknesses", label: "Weaknesses", prompt: "What's failing? What patterns of struggle showed up?" },
              { key: "opportunities", label: "Opportunities", prompt: "What doors opened? What could you leverage?" },
              { key: "threats", label: "Threats", prompt: "What could derail you? What do you need to prepare for?" },
            ].map(({ key, label, prompt }) => (
              <div key={key}>
                <Label>{label}</Label>
                <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 4 }}>{prompt}</div>
                <TextArea
                  value={mEntry[key] || ""}
                  onChange={(v) => updateM(key, v)}
                  placeholder={`Your honest ${label.toLowerCase()}...`}
                  rows={3}
                />
              </div>
            ))}
          </SectionCard>

          <SectionCard title="Identity Shifting" subtitle="Who am I becoming">
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12 }}>
              Write "I am..." statements as if you've already become this person.
            </div>
            {[
              { key: "personality", label: "Personality" },
              { key: "lifestyle", label: "Lifestyle" },
              { key: "health", label: "Health" },
              { key: "mental", label: "Mental" },
              { key: "career", label: "Career" },
              { key: "relationships", label: "Relationships" },
            ].map(({ key, label }) => (
              <div key={key}>
                <Label>{label}</Label>
                <TextArea
                  value={mEntry[key] || ""}
                  onChange={(v) => updateM(key, v)}
                  placeholder={`I am...`}
                  rows={2}
                />
              </div>
            ))}
          </SectionCard>
        </>
      )}

      <SaveButton onSave={handleSave} saved={saved} />
    </div>
  );
}

// ─── Shadow Work & Behavior Loop ──────────────────────────────────────────────

function ShadowSection({ data, setData }) {
  const key = `shadow_${thisMonth}`;
  const entry = data[key] || {};
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("shadow");

  function update(field, val) {
    setData((prev) => ({ ...prev, [key]: { ...entry, [field]: val } }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    saveData(data);
  }

  const shadowPrompts = [
    { key: "q1", prompt: "What quality do you dislike most in others? Where do you secretly have this quality in yourself?" },
    { key: "q2", prompt: "What do you want but feel ashamed to admit? Why did you learn to hide this desire?" },
    { key: "q3", prompt: "What triggers you intensely without you understanding why? What fear or wound does it touch?" },
    { key: "q4", prompt: "What painful pattern repeats in your life? What role do YOU play in creating it?" },
    { key: "q5", prompt: "What criticism from childhood shaped you? What part of yourself did you suppress to survive?" },
    { key: "q6", prompt: "Who do you admire most? What quality fascinates you? Why can't you claim it in yourself?" },
    { key: "q7", prompt: "If no one would judge you, who would you be? What would you actually want?" },
  ];

  const behaviorPrompts = [
    { key: "b1", prompt: "What painful pattern repeats in your life (relationships, work, success, shame)? When does it start?" },
    { key: "b2", prompt: "What event or trigger activates this pattern? Who or what situation makes it begin?" },
    { key: "b3", prompt: "What automatic thought appears when triggered? What story do you tell yourself (\"I always...\", \"I never...\")?"},
    { key: "b4", prompt: "What emotion follows this thought (shame, anxiety, anger, hopelessness)? Where do you feel it in your body?" },
    { key: "b5", prompt: "What behavior do you do or avoid doing as a result (withdraw, people-please, procrastinate, overwork)?" },
    { key: "b6", prompt: "How does this behavior reinforce your original thought? What happens next that proves the thought true?" },
    { key: "b7", prompt: "Which part of the cycle will you interrupt first — change your thought, manage your feeling, or choose a different behavior?" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.accent}` }}>
        {["shadow", "behavior"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "12px 0",
              background: tab === t ? COLORS.rose : "transparent",
              color: tab === t ? COLORS.white : COLORS.muted,
              border: "none",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: 15,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {t === "shadow" ? "Shadow Work" : "Behavior Loop"}
          </button>
        ))}
      </div>

      {tab === "shadow" && (
        <SectionCard title="Shadow Work" subtitle="Monthly deep work" accent>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16, lineHeight: 1.7 }}>
            Your shadow is the hidden part of you. Bringing it into the light is where real change begins. Answer honestly — no one will read this but you.
          </div>
          {shadowPrompts.map(({ key: k, prompt }, i) => (
            <div key={k}>
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.roseDark,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  marginTop: 20,
                  marginBottom: 6,
                  lineHeight: 1.6,
                }}
              >
                {i + 1}. {prompt}
              </div>
              <TextArea
                value={entry[k] || ""}
                onChange={(v) => update(k, v)}
                placeholder="Write honestly..."
                rows={3}
              />
            </div>
          ))}
        </SectionCard>
      )}

      {tab === "behavior" && (
        <SectionCard title="Behavior Pattern" subtitle="Break the cycle" accent>
          <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16, lineHeight: 1.7 }}>
            A pattern repeats because your thoughts, feelings, and behaviors reinforce each other. Name it clearly and it loses its power.
          </div>
          {behaviorPrompts.map(({ key: k, prompt }, i) => (
            <div key={k}>
              <div
                style={{
                  fontSize: 13,
                  color: COLORS.roseDark,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  marginTop: 20,
                  marginBottom: 6,
                  lineHeight: 1.6,
                }}
              >
                {i + 1}. {prompt}
              </div>
              <TextArea
                value={entry[k] || ""}
                onChange={(v) => update(k, v)}
                placeholder="Be honest with yourself..."
                rows={3}
              />
            </div>
          ))}
        </SectionCard>
      )}

      <SaveButton onSave={handleSave} saved={saved} />
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function BloomAgain() {
  const [tab, setTab] = useState("daily");
  const [data, setData] = useState(loadData);

  const tabs = [
    { id: "daily", icon: "✦", label: "Daily" },
    { id: "weekly", icon: "◈", label: "Weekly & Monthly" },
    { id: "shadow", icon: "❋", label: "Deep Work" },
  ];

  const dateStr = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.cream,
        fontFamily: "Georgia, serif",
        color: COLORS.text,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: COLORS.rose,
          padding: "28px 20px 20px",
          textAlign: "center",
          position: "sticky",
          top: 0,
          zIndex: 10,
          boxShadow: "0 2px 16px rgba(155,90,106,0.2)",
        }}
      >
        <div style={{ fontSize: 32, fontStyle: "italic", color: COLORS.white, letterSpacing: 1, marginBottom: 2 }}>
          Bloom Again
        </div>
        <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 2, textTransform: "uppercase" }}>
          {dateStr}
        </div>
      </div>

      {/* Nav */}
      <div
        style={{
          display: "flex",
          background: COLORS.white,
          borderBottom: `1px solid ${COLORS.accent}`,
          position: "sticky",
          top: 86,
          zIndex: 9,
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "12px 4px",
              background: "transparent",
              border: "none",
              borderBottom: tab === t.id ? `2px solid ${COLORS.rose}` : "2px solid transparent",
              color: tab === t.id ? COLORS.rose : COLORS.muted,
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
              fontFamily: "Georgia, serif",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 2 }}>{t.icon}</div>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px 60px" }}>
        {tab === "daily" && <DailySection data={data} setData={setData} />}
        {tab === "weekly" && <WeeklyMonthlySection data={data} setData={setData} />}
        {tab === "shadow" && <ShadowSection data={data} setData={setData} />}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "16px", color: COLORS.muted, fontSize: 11, fontStyle: "italic" }}>
        You are not broken. You are becoming. 🌸
      </div>
    </div>
  );
}
