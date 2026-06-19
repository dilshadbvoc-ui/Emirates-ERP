import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

const SYSTEM_PROMPT = `You are the IGCC Dubai Mainland License Assistant. You help users understand the mainland license application process in Dubai. You are knowledgeable about:

- Activity types: Professional (consultancies, IT services, marketing, HR, accounting, education), Commercial (general trading, import/export, retail, e-commerce, wholesale, foodstuff), Industrial (manufacturing, assembly, packaging, processing, factory operations)
- Legal structures: LLC (Limited Liability Company - most common), Branch of foreign company, Sole Establishment (single owner)
- Trade name registration: English names cost AED 2,000 extra, Arabic names have no additional fee
- Office space: Virtual office, Physical office, or Sharing office
- Visa allocations: Investor visa and Employment visas (costs vary by category and nationality)
- Costs: Base procedure cost is AED 3,414. Total varies based on activity type, external approvals, visa requirements, and trade name language.

Be professional, helpful, and concise. Answer in the same language the user asks. If you don't know something specific, suggest they contact the IGCC team directly at info@igcc.ae or visit our office.`;

export const aiRouter = createRouter({
  chat: publicQuery
    .input(
      z.object({
        message: z.string().min(1),
        history: z.array(
          z.object({
            role: z.enum(["user", "assistant"]),
            content: z.string(),
          })
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Call the AI service
        const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.AI_API_KEY || ""}`,
          },
          body: JSON.stringify({
            model: "moonshot-v1-8k",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              ...(input.history || []).map((h) => ({ role: h.role, content: h.content })),
              { role: "user", content: input.message },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          // Fallback response if AI service is unavailable
          return {
            response: getFallbackResponse(input.message),
          };
        }

        const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
        return {
          response: data.choices?.[0]?.message?.content || getFallbackResponse(input.message),
        };
      } catch {
        return {
          response: getFallbackResponse(input.message),
        };
      }
    }),
});

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("cost") || lower.includes("price") || lower.includes("aed")) {
    return "The base mainland license procedure cost is AED 3,414. Additional costs include: English trade name (+AED 2,000), investor visa (+AED 4,000), employment visas (+AED 3,000 each), and external approval fees which vary by activity type. For a precise quote, please complete our application wizard.";
  }

  if (lower.includes("activity") || lower.includes("business")) {
    return "We offer three activity types: Professional (consultancies, IT, marketing, HR, accounting), Commercial (trading, import/export, retail, e-commerce), and Industrial (manufacturing, assembly, packaging). Each has specific activities and requirements.";
  }

  if (lower.includes("visa")) {
    return "We help with Investor visas and Employment visas. Investor visas are for business owners, while Employment visas are for staff you hire. Visa costs vary by category and nationality. You can specify your visa needs in our application wizard.";
  }

  if (lower.includes("document") || lower.includes("paper")) {
    return "Required documents typically include: passport copies, visa copies, Emirates ID (if applicable), NOC from sponsor (if applicable), and MOA (Memorandum of Association). Specific requirements vary by business structure and activity.";
  }

  if (lower.includes("time") || lower.includes("long") || lower.includes("day")) {
    return "Mainland license processing typically takes 5-7 working days after document submission. However, timelines can vary based on activity type, external approvals required, and government processing times.";
  }

  return "Thank you for your question about Dubai mainland licenses. I'd be happy to help! Could you provide more details about what you'd like to know? You can also reach our team directly at info@igcc.ae for personalized assistance.";
}
