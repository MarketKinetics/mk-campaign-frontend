// Read the human-facing fields out of a TAR. Keeps the "Target Audience does X"
// objective phrasing generic (subject shown as "Target Audience", never "TA" or a
// specific name), per design. TA/objective-agnostic — works for any TAR domain.

export function readTar(tar) {
  if (!tar || typeof tar !== "object") return null;
  const audienceName = tar.audience_name || tar.header?.target_audience?.label || null;

  // objective: sobj_statement is stored as "TA <does something>". Show with the
  // subject normalized to "Target Audience" for a clean, generic read-out.
  let objective = tar.sobj_statement || tar.assessment?.target_behavior || null;
  if (objective) {
    objective = objective.replace(/^TA\b/i, "Target Audience");
  }
  const direction = tar.sobj_direction || null;

  return {
    audienceName,
    objective,       // e.g. "Target Audience refrain from downgrading total coverage"
    direction,       // e.g. "decrease"
    valid: !!tar.vulnerabilities,
    gatePassed: tar.gate_passed !== false,
  };
}
