/**
 * Utility to open the Oracle modal programmatically
 * This triggers the floating chat button to open the premium experience
 */
export function openOracle(prompt?: string, autoSubmit?: boolean) {
  // If a prompt is provided, store it for the chat to pick up
  if (prompt) {
    localStorage.setItem('maven_chat_prompt', prompt);
    if (autoSubmit) {
      localStorage.setItem('maven_chat_autosubmit', 'true');
    }
  }
  
  // Find and click the chat toggle button
  const chatToggle = document.querySelector('[data-chat-toggle]') as HTMLButtonElement;
  if (chatToggle) {
    // Check if already open by looking for the modal
    const isOpen = document.querySelector('.fixed.inset-0.z-50');
    if (!isOpen) {
      chatToggle.click();
    }
    
    // Dispatch event for prompt handling
    if (prompt) {
      setTimeout(() => {
        window.dispatchEvent(new Event('maven_prompt'));
      }, 100);
    }
  } else {
    // Fallback: navigate to oracle page if floating chat isn't available
    window.location.href = '/oracle';
  }
}

/**
 * Hook-friendly version for React components
 */
export function useOpenOracle() {
  return {
    open: (prompt?: string, autoSubmit?: boolean) => openOracle(prompt, autoSubmit)
  };
}
