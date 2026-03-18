// ─── Default style config ─────────────────────────────────────────────────────

export const DEFAULT_STYLE_CONFIG = {
  icon_style: {
    perspective: "soft isometric (slight tilt, friendly angle)",
    geometry: {
      proportions: "1:1 square canvas, generous breathing room around object",
      element_arrangement:
        "single centered main object, optional tiny secondary detail for context",
    },
    composition: {
      element_count: "1–2 objects only",
      scene_density: "minimal, calm, uncluttered",
    },
    lighting: {
      type: "soft diffuse daylight",
      light_source: "top-left or top-center, evenly spread",
      shadow: "very soft grounding shadow, close to object",
      highlighting: "subtle highlights, no sharp specular shine",
    },
    textures: {
      material_finish: "soft matte, lightly handcrafted feel",
      surface_treatment:
        "stylized, cozy realism (faint grain lines, soft fabric, gentle food texture)",
    },
    render_quality: {
      resolution: "high-resolution stylized 3D or painterly render",
      edge_definition: "soft edges, no hard outlines",
      visual_clarity: "clear silhouette, instantly readable at small sizes",
    },
    color_palette: {
      tone: "warm, natural, comforting",
      range: "earthy pastels and muted naturals (no neon, no harsh contrast)",
    },
    background: {
      color: "transparent",
    },
    stylistic_tone: "cozy, wholesome, calm, handcrafted, storybook-farm",
    constraints: {
      avoid: [
        "photorealism",
        "plastic shine",
        "hard shadows",
        "busy scenes",
        "text or labels",
        "background elements",
      ],
    },
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type StyleConfig = typeof DEFAULT_STYLE_CONFIG;

// ─── Prompt builder ───────────────────────────────────────────────────────────

export function buildPrompt(
  styleConfig: StyleConfig,
  name: string,
  description?: string,
): string {
  const style = styleConfig.icon_style;
  const parts: string[] = [];

  parts.push(description ? description : `An icon for ${name}`);

  if (style.perspective) parts.push(style.perspective);
  if (style.stylistic_tone) parts.push(style.stylistic_tone + " style");

  if (style.composition) {
    if (style.composition.element_count)
      parts.push(style.composition.element_count);
    if (style.composition.scene_density)
      parts.push(style.composition.scene_density);
  }

  if (style.geometry) {
    if (style.geometry.proportions) parts.push(style.geometry.proportions);
    if (style.geometry.element_arrangement)
      parts.push(style.geometry.element_arrangement);
  }

  if (style.lighting) {
    if (style.lighting.type) parts.push(style.lighting.type);
    if (style.lighting.light_source)
      parts.push(`light from ${style.lighting.light_source}`);
    if (style.lighting.shadow) parts.push(style.lighting.shadow);
    if (style.lighting.highlighting) parts.push(style.lighting.highlighting);
  }

  if (style.textures) {
    if (style.textures.material_finish)
      parts.push(style.textures.material_finish);
    if (style.textures.surface_treatment)
      parts.push(style.textures.surface_treatment);
  }

  if (style.render_quality) {
    if (style.render_quality.resolution)
      parts.push(style.render_quality.resolution);
    if (style.render_quality.edge_definition)
      parts.push(style.render_quality.edge_definition);
    if (style.render_quality.visual_clarity)
      parts.push(style.render_quality.visual_clarity);
  }

  if (style.color_palette) {
    if (style.color_palette.tone)
      parts.push(`${style.color_palette.tone} tones`);
    if (style.color_palette.range) parts.push(style.color_palette.range);
  }

  const bgColor = style.background?.color;
  if (bgColor) {
    if (bgColor.toLowerCase() === "transparent") {
      parts.push("transparent background, no background");
    } else {
      parts.push(`${bgColor} background`);
    }
  }

  if (style.constraints?.avoid?.length) {
    parts.push(`avoid: ${style.constraints.avoid.join(", ")}`);
  }

  return parts.join(", ");
}
