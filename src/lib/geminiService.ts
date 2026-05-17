
export const geminiService = {
  analyzeProblem: async (content: string) => {
    try {
      const response = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to call Gemini API");
      }

      const data = await response.json();
      return data.text;
    } catch (error: any) {
      console.error("Gemini Error:", error);
      throw error; // Let the component handle display
    }
  }
};
