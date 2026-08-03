//renderButton.ts
interface PartnerCall {
  id: string;
  label: string;
}

function renderButton(call: PartnerCall, snippetResult: any, ctx: any) {
  const button = document.createElement("button");

  // 1. Label (from registry, not snippet)
  button.textContent = call.label;

  // 2. Shared styling
  button.classList.add("partner-btn");

  // 3. Shared logging
  button.addEventListener("click", () => {
    console.log(`[Partner] Click: ${call.id}`);

    try {
      snippetResult?.onClick?.(ctx);
    } catch (err) {
      console.error(`[Partner] Error in ${call.id}`, err);
    }
  });

  return button;
}
