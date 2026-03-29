"""
Explainability Engine (Phase 5) — Powered by Google Gemini API (google.genai SDK)

ENHANCED VERSION — Deep structured explanations with:
  - 4-section per-element analysis (Recommendation, Tradeoff, Concerns, Guidance)
  - Comprehensive floor-plan-level report (Health, Load Paths, Risks, Actions)
  - 1200 token limit for rich, detailed output
  - Structured section headers for frontend rendering
"""

import os
import logging
from typing import List, Optional
from google import genai
from google.genai import types as genai_types
from app.models.schemas import ElementAnalysis, StructuralSummary

logger = logging.getLogger(__name__)


def _get_gemini_client() -> Optional[genai.Client]:
    """Initialize and return Gemini client, or None if key not configured."""
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key or api_key == "your_gemini_api_key_here":
        logger.warning("GEMINI_API_KEY not set — using fallback template explanations.")
        return None
    try:
        client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialized successfully (google.genai SDK).")
        return client
    except Exception as e:
        logger.error(f"Failed to initialize Gemini client: {e}")
        return None


# ─── Fallback Template Explanations ──────────────────────────────────────────

def _fallback_explanation(analysis: ElementAnalysis) -> str:
    """Detailed deterministic fallback if Gemini is unavailable."""
    top = analysis.ranked_materials[0] if analysis.ranked_materials else None
    second = analysis.ranked_materials[1] if len(analysis.ranked_materials) > 1 else None
    third = analysis.ranked_materials[2] if len(analysis.ranked_materials) > 2 else None
    if not top:
        return "No materials could be ranked for this element."

    concerns_text = ""
    if analysis.structural_concerns:
        concerns_text = "\n\n**Structural Concerns:** " + " | ".join(
            f"[{c.severity.upper()}] {c.message}" for c in analysis.structural_concerns
        )
    else:
        concerns_text = "\n\n**Structural Concerns:** No structural concerns detected for this element. The span and dimensions are within safe limits for the recommended material."

    tradeoff = ""
    if second:
        tradeoff = f" {second.name} scored {second.score}/100 as the runner-up"
        if third:
            tradeoff += f", while {third.name} scored {third.score}/100."
        else:
            tradeoff += "."

    role_display = analysis.structural_role.replace("_", "-")

    return (
        f"**Material Recommendation:** {top.name} is the top-ranked material for this "
        f"{analysis.element_type} (structural role: {role_display}, estimated span: "
        f"{analysis.span_estimate_m}m, area: {analysis.area_estimate_m2}m²). It delivers "
        f"{top.strength} structural strength with {top.durability} durability at {top.cost} "
        f"cost — optimal for '{top.best_use}'. Tradeoff score: {top.score}/100.\n\n"
        f"**Cost vs Strength Tradeoff:** {top.name} leads with a score of {top.score}/100 "
        f"(cost component: {top.cost_score}, strength: {top.strength_score}, durability: "
        f"{top.durability_score}).{tradeoff} The scoring formula weights strength most heavily "
        f"for {role_display} elements, making {top.name} the optimal economic and structural choice."
        f"{concerns_text}\n\n"
        f"**Builder Guidance:** Ensure {top.name} units meet IS standards for {role_display} "
        f"applications. For the {analysis.span_estimate_m}m span, verify mortar joint consistency "
        f"and apply appropriate curing time before load application."
    )


def _fallback_overall(analyses: List[ElementAnalysis], summary: StructuralSummary) -> str:
    """Detailed overall fallback explanation."""
    concern_text = (
        f"**Critical Risks:** {summary.critical_concerns} critical structural concern(s) were "
        f"detected and require immediate attention before construction begins. Review all "
        f"elements flagged as CRITICAL in the element analysis above."
        if summary.critical_concerns > 0
        else "**Structural Health:** No critical structural concerns were detected across all "
             "analyzed elements. The floor plan appears structurally sound based on span and "
             "role analysis."
    )

    return (
        f"**Overall Assessment:** This floor plan contains {summary.total_elements} structural "
        f"elements: {summary.load_bearing_count} load-bearing walls, {summary.partition_count} "
        f"partition walls, {summary.column_count} columns, and {summary.opening_count} openings. "
        f"The maximum detected span is {summary.max_span_m}m.\n\n"
        f"**Load Path Analysis:** Load-bearing walls account for "
        f"{round(summary.load_bearing_count / max(summary.total_elements, 1) * 100)}% of all "
        f"structural elements, forming the primary vertical load transfer path. "
        f"{'Column placement supports long-span zones. ' if summary.column_count > 0 else ''}"
        f"Partition walls carry no structural load and can be treated with lighter materials.\n\n"
        f"{concern_text}\n\n"
        f"**Key Recommendations:** Prioritize RCC or Steel Frame for any spans exceeding 5m. "
        f"Ensure all load-bearing walls are aligned vertically across floors if multi-storey. "
        f"Review opening placements to confirm proper lintel support above all doors and windows."
    )


# ─── Gemini Prompt Builders ───────────────────────────────────────────────────

def _build_element_prompt(analysis: ElementAnalysis) -> str:
    top_mats = analysis.ranked_materials[:3]
    mat_lines = "\n".join(
        f"  {i+1}. {m.name} — Cost: {m.cost}, Strength: {m.strength}, "
        f"Durability: {m.durability}, Score: {m.score}/100 "
        f"(cost contrib: {m.cost_score}, strength contrib: {m.strength_score}, "
        f"durability contrib: {m.durability_score})"
        for i, m in enumerate(top_mats)
    )
    concerns_str = (
        "\n".join(f"  - [{c.severity.upper()}] {c.message}" for c in analysis.structural_concerns)
        if analysis.structural_concerns
        else "  None detected."
    )

    return f"""You are a senior structural engineering AI assistant embedded in a floor plan analysis system.

Generate a DETAILED, structured explanation for this architectural element's material recommendation.
Your response MUST follow exactly this 4-section format with these exact headers:

**Material Recommendation:** [2-3 sentences explaining WHY the #1 material was chosen. Cite the exact score ({top_mats[0].score if top_mats else 'N/A'}/100), the span ({analysis.span_estimate_m}m), the element role ({analysis.structural_role.replace('_', ' ')}), and at least two specific material properties — strength and durability values.]

**Cost vs Strength Tradeoff:** [2-3 sentences comparing all 3 ranked materials. Explain the score differences. Explain why the cost-strength balance favours the top pick for this specific role. Mention when a lower-ranked option might be preferable (e.g., budget constraints).]

**Structural Concerns:** [1-3 sentences. If concerns exist, explain each one clearly in non-expert language and say what the builder should do. If no concerns, explicitly confirm the element is within safe structural limits.]

**Builder Guidance:** [1-2 actionable sentences with specific practical advice for the construction team — covering installation, curing, or inspection steps relevant to this material and element type.]

Element Details:
  Type: {analysis.element_type}
  Structural Role: {analysis.structural_role.replace('_', ' ')}
  Estimated Span: {analysis.span_estimate_m}m
  Estimated Height: {analysis.height_estimate_m}m
  Area: {analysis.area_estimate_m2}m²

Ranked Materials (scored with role-specific weights):
{mat_lines}

Structural Concerns:
{concerns_str}

IMPORTANT: Use EXACTLY the four headers shown above. Write in plain English readable by a non-expert. Do not add any extra headers or bullet points outside the format."""


def _build_overall_prompt(
    analyses: List[ElementAnalysis],
    summary: StructuralSummary,
) -> str:
    # Collect top concerns across all elements
    all_concerns = []
    for a in analyses:
        for c in a.structural_concerns:
            all_concerns.append(f"  [{c.severity.upper()}] {a.element_type} ({a.element_id}): {c.message}")
    concerns_block = "\n".join(all_concerns[:6]) if all_concerns else "  None detected."

    # Most expensive elements by span
    top_spans = sorted(analyses, key=lambda a: a.span_estimate_m, reverse=True)[:3]
    span_lines = "\n".join(
        f"  - {a.element_type} ({a.element_id}): {a.span_estimate_m}m span, "
        f"top material: {a.ranked_materials[0].name if a.ranked_materials else 'N/A'}"
        for a in top_spans
    )

    return f"""You are a senior structural engineering AI assistant generating a comprehensive floor plan assessment.

Generate a DETAILED structured report. Follow exactly this 4-section format:

**Overall Assessment:** [2-3 sentences summarizing the floor plan's structural composition. Mention exact counts: {summary.total_elements} total elements, {summary.load_bearing_count} load-bearing walls, {summary.partition_count} partition walls, {summary.column_count} columns, {summary.opening_count} openings. Comment on the overall structural complexity.]

**Load Path Analysis:** [2-3 sentences explaining the primary vertical and horizontal load transfer paths. Comment on the ratio of load-bearing to partition elements ({round(summary.load_bearing_count / max(summary.total_elements, 1) * 100)}% load-bearing). Identify the maximum span of {summary.max_span_m}m and which structural category it belongs to. Note whether column placement is adequate.]

**Risk Summary:** [2-3 sentences. If {summary.critical_concerns} critical concerns exist, explain each clearly in plain language and urgency. If warnings exist, mention general risk areas. If all clear, confirm structural safety and explain what that means for the construction.]

**Key Recommendations:** [3-4 specific, actionable recommendations for the construction team. Each should reference a specific part of the analysis — e.g., specific element types, the maximum span, material choices on the critical path. Number each recommendation.]

Floor Plan Summary:
  Total Elements: {summary.total_elements}
  Load-Bearing Walls: {summary.load_bearing_count}
  Partition Walls: {summary.partition_count}
  Columns: {summary.column_count}
  Openings (doors/windows): {summary.opening_count}
  Maximum Detected Span: {summary.max_span_m}m
  Critical Concerns Count: {summary.critical_concerns}

Top Structural Concerns:
{concerns_block}

Longest Span Elements:
{span_lines}

IMPORTANT: Use EXACTLY the four headers shown above. Be specific, cite measurements, and write in plain English. Do not add extra headers."""


# ─── Explainability Engine ────────────────────────────────────────────────────

class ExplainabilityEngine:
    """
    Uses Google Gemini (google.genai SDK) to generate deep, structured plain-language
    explanations for material recommendations and structural assessments.
    """

    MODEL = "gemini-2.0-flash"

    def __init__(self):
        self.client = _get_gemini_client()

    def _call_gemini(self, prompt: str, fallback: str) -> str:
        """Call Gemini API with error handling."""
        if self.client is None:
            return fallback
        try:
            response = self.client.models.generate_content(
                model=self.MODEL,
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    temperature=0.6,
                    max_output_tokens=1200,
                ),
            )
            text = response.text.strip() if response.text else ""
            return text if text else fallback
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return fallback

    def explain_element(self, analysis: ElementAnalysis) -> str:
        """Generate a deep, structured explanation for one element."""
        prompt   = _build_element_prompt(analysis)
        fallback = _fallback_explanation(analysis)
        return self._call_gemini(prompt, fallback)

    def explain_overall(
        self,
        analyses: List[ElementAnalysis],
        summary: StructuralSummary,
    ) -> str:
        """Generate a comprehensive structural assessment for the full floor plan."""
        if not analyses:
            return "No elements were detected in this floor plan."

        prompt   = _build_overall_prompt(analyses, summary)
        fallback = _fallback_overall(analyses, summary)
        return self._call_gemini(prompt, fallback)

    def enrich_analyses(
        self,
        analyses: List[ElementAnalysis],
        summary: StructuralSummary,
    ) -> tuple[List[ElementAnalysis], str]:
        """
        Fill in the `explanation` field for each ElementAnalysis and
        generate the overall floor plan explanation.
        Returns (enriched_analyses, overall_explanation).
        """
        enriched = []
        for analysis in analyses:
            explanation = self.explain_element(analysis)
            enriched.append(analysis.model_copy(update={"explanation": explanation}))

        overall = self.explain_overall(enriched, summary)
        return enriched, overall
