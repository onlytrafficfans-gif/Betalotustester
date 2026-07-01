/**
 * Mock AI Provider
 * 
 * Simulates AI responses for development and testing without using real API keys.
 * Generates structured responses that match the app builder schema.
 */

import { AIProvider, AIRequest, AIResponse } from "./genericProvider";

export class MockProvider implements AIProvider {
  name = "Mock";
  models = ["mock-dev"];
  private responseDelay: number;

  constructor(delay = 1500) {
    this.responseDelay = delay;
  }

  async sendMessage(request: AIRequest): Promise<AIResponse> {
    // Simulate network delay
    await this.delay(this.responseDelay);

    const userMessage = request.messages.find((m) => m.role === "user")?.content || "";
    const lowerMessage = userMessage.toLowerCase();

    // Route to appropriate response generator
    let content: string;

    if (lowerMessage.includes("build") || lowerMessage.includes("create") || lowerMessage.includes("app")) {
      content = this.generateAppResponse(userMessage);
    } else if (lowerMessage.includes("edit") || lowerMessage.includes("update") || lowerMessage.includes("change")) {
      content = this.generateEditResponse(userMessage);
    } else if (lowerMessage.includes("deploy") || lowerMessage.includes("publish")) {
      content = this.generateDeployResponse();
    } else if (lowerMessage.includes("fix") || lowerMessage.includes("error") || lowerMessage.includes("bug")) {
      content = this.generateFixResponse(userMessage);
    } else {
      content = this.generateGeneralResponse(userMessage);
    }

    return {
      content,
      usage: {
        promptTokens: userMessage.length / 4,
        completionTokens: content.length / 4,
        totalTokens: (userMessage.length + content.length) / 4,
      },
      model: "mock-dev",
    };
  }

  async streamMessage(
    request: AIRequest,
    onChunk: (chunk: string) => void
  ): Promise<AIResponse> {
    const response = await this.sendMessage(request);

    // Stream the content word by word
    const words = response.content.split(" ");
    let streamedContent = "";

    for (const word of words) {
      await this.delay(30);
      const chunk = word + " ";
      streamedContent += chunk;
      onChunk(chunk);
    }

    return {
      ...response,
      content: streamedContent.trim(),
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private generateAppResponse(message: string): string {
    const appType = this.detectAppType(message);

    switch (appType) {
      case "todo":
        return `I'll build a beautiful todo list app for you!

\`\`\`json
{
  "name": "TaskFlow",
  "description": "A clean and intuitive todo list app with categories and priorities",
  "screens": [
    {
      "name": "Home",
      "components": [
        { "type": "header", "title": "My Tasks", "showAddButton": true },
        { "type": "tabs", "tabs": ["All", "Active", "Completed"] },
        { "type": "taskList", "emptyState": "No tasks yet. Add your first task!" },
        { "type": "fab", "icon": "plus", "action": "addTask" }
      ]
    },
    {
      "name": "AddTask",
      "components": [
        { "type": "header", "title": "New Task", "showBackButton": true },
        { "type": "input", "label": "Task name", "placeholder": "What needs to be done?" },
        { "type": "select", "label": "Priority", "options": ["Low", "Medium", "High"] },
        { "type": "select", "label": "Category", "options": ["Personal", "Work", "Shopping", "Health"] },
        { "type": "datePicker", "label": "Due date" },
        { "type": "button", "text": "Add Task", "variant": "primary" }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#6366f1",
    "secondaryColor": "#8b5cf6",
    "backgroundColor": "#fafafa",
    "cardStyle": "rounded-xl"
  },
  "features": ["localStorage", "swipeToDelete", "dragReorder"]
}
\`\`\`

I've created **TaskFlow**, a modern todo app with:
- **Tab filtering** (All/Active/Completed)
- **Priority levels** (Low/Medium/High) 
- **Categories** to organize tasks
- **Due dates** with date picker
- **Swipe to delete** gestures
- Clean, card-based design with your chosen color scheme`;

      case "ecommerce":
        return `I'll build a sleek e-commerce app for you!

\`\`\`json
{
  "name": "ShopEase",
  "description": "Modern e-commerce app with product browsing, cart, and checkout",
  "screens": [
    {
      "name": "Home",
      "components": [
        { "type": "searchBar", "placeholder": "Search products..." },
        { "type": "carousel", "items": ["Banner 1", "Banner 2", "Banner 3"] },
        { "type": "categoryGrid", "categories": ["Electronics", "Fashion", "Home", "Sports"] },
        { "type": "productGrid", "title": "Trending Now" }
      ]
    },
    {
      "name": "ProductDetail",
      "components": [
        { "type": "imageGallery", "height": 300 },
        { "type": "text", "variant": "title", "content": "Product Name" },
        { "type": "text", "variant": "price", "content": "$99.99" },
        { "type": "rating", "value": 4.5 },
        { "type": "text", "variant": "body", "content": "Product description goes here..." },
        { "type": "button", "text": "Add to Cart", "variant": "primary" }
      ]
    },
    {
      "name": "Cart",
      "components": [
        { "type": "header", "title": "Shopping Cart" },
        { "type": "cartList" },
        { "type": "divider" },
        { "type": "summary", "items": ["Subtotal", "Shipping", "Total"] },
        { "type": "button", "text": "Checkout", "variant": "primary" }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#f97316",
    "backgroundColor": "#ffffff",
    "cardStyle": "rounded-2xl shadow-lg"
  },
  "features": ["cart", "search", "wishlist"]
}
\`\`\`

I've created **ShopEase**, a complete shopping app with:
- **Product browsing** with search and categories
- **Image galleries** for product detail views
- **Shopping cart** with quantity controls
- **Checkout flow** with order summary`;

      case "fitness":
        return `I'll build a motivating fitness tracking app for you!

\`\`\`json
{
  "name": "FitPulse",
  "description": "Fitness tracker with workout logging, progress charts, and goals",
  "screens": [
    {
      "name": "Dashboard",
      "components": [
        { "type": "header", "title": "Today's Activity" },
        { "type": "statsRow", "stats": [{"label": "Steps", "value": "8,432"}, {"label": "Calories", "value": "420"}, {"label": "Active Min", "value": "45"}] },
        { "type": "progressRing", "title": "Daily Goal", "percentage": 75 },
        { "type": "chart", "type": "bar", "title": "Weekly Activity" },
        { "type": "sectionTitle", "title": "Today's Workouts" },
        { "type": "workoutList" }
      ]
    },
    {
      "name": "WorkoutDetail",
      "components": [
        { "type": "header", "title": "Workout", "showBackButton": true },
        { "type": "timer", "size": "large" },
        { "type": "exerciseList", "showCheckboxes": true },
        { "type": "button", "text": "Complete Workout", "variant": "primary" }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#10b981",
    "secondaryColor": "#34d399",
    "backgroundColor": "#0f172a",
    "darkMode": true
  },
  "features": ["timer", "progressTracking", "charts"]
}
\`\`\`

I've created **FitPulse**, a fitness app with:
- **Activity dashboard** with step counter and calorie tracker
- **Progress ring** showing daily goal completion
- **Weekly charts** to visualize your activity
- **Workout timer** with exercise checklists`;

      default:
        return `I'll build that app for you!

\`\`\`json
{
  "name": "MyApp",
  "description": "A custom app built from your description",
  "screens": [
    {
      "name": "Home",
      "components": [
        { "type": "header", "title": "Welcome" },
        { "type": "text", "content": "Your app is ready!" },
        { "type": "button", "text": "Get Started", "variant": "primary" }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#6366f1",
    "backgroundColor": "#ffffff"
  },
  "features": []
}
\`\`\`

I've created a starter app based on your description. Would you like me to add more screens or customize the design?`;
    }
  }

  private generateEditResponse(message: string): string {
    return `I'll make those changes for you!

\`\`\`json
{
  "action": "edit",
  "changes": [
    {
      "target": "screen",
      "operation": "update",
      "description": "Updated based on your request"
    }
  ]
}
\`\`\`

I've updated the app with your requested changes. The modifications have been applied to the design and layout.`;
  }

  private generateDeployResponse(): string {
    return `Your app is ready for deployment! 🚀

I can deploy it in several ways:

1. **Web App** - Deploy as a Progressive Web App (PWA) that works on any device
2. **Static Export** - Generate static HTML/CSS/JS files for hosting anywhere
3. **Preview Link** - Get a shareable preview link to test on your phone

Which deployment option would you prefer?`;
  }

  private generateFixResponse(message: string): string {
    return `I'll fix that issue for you!

\`\`\`json
{
  "action": "fix",
  "issues": [
    {
      "type": "layout",
      "description": "Fixed responsive layout issues"
    }
  ]
}
\`\`\`

I've identified and fixed the issues in your app. The layout and functionality should now work correctly across all screen sizes.`;
  }

  private generateGeneralResponse(message: string): string {
    const responses = [
      `I can help you with that! Let me analyze your request and build the perfect solution. What specific features would you like to include?`,
      `Great idea! I can build that for you. Would you like me to start with a specific design style or color scheme?`,
      `I'll get started on that right away. Is there anything specific you'd like me to focus on - the UI design, the user flow, or specific functionality?`,
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private detectAppType(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes("todo") || lower.includes("task")) return "todo";
    if (lower.includes("shop") || lower.includes("store") || lower.includes("ecommerce") || lower.includes("product")) return "ecommerce";
    if (lower.includes("fitness") || lower.includes("workout") || lower.includes("gym") || lower.includes("exercise")) return "fitness";
    if (lower.includes("social") || lower.includes("chat") || lower.includes("message")) return "social";
    if (lower.includes("food") || lower.includes("recipe") || lower.includes("restaurant")) return "food";
    return "default";
  }
}
