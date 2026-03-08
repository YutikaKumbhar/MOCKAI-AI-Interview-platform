@tailwind base;
@tailwind components;
@tailwind utilities;

/* Definition of the design system. All colors, gradients, fonts, etc should be defined here. 
All colors MUST be HSL.
*/

@layer base {
  :root {
    --background: 220 25% 98%;
    --foreground: 230 30% 12%;

    --card: 0 0% 100%;
    --card-foreground: 230 30% 12%;

    --popover: 0 0% 100%;
    --popover-foreground: 230 30% 12%;

    --primary: 240 68% 58%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 245 75% 65%;

    --secondary: 260 58% 62%;
    --secondary-foreground: 0 0% 100%;

    --muted: 220 20% 94%;
    --muted-foreground: 230 15% 45%;

    --accent: 280 65% 60%;
    --accent-foreground: 0 0% 100%;

    --success: 142 76% 48%;
    --success-foreground: 0 0% 100%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 220 20% 90%;
    --input: 220 20% 90%;
    --ring: 240 68% 58%;

    --radius: 0.75rem;
    
    /* Gradients */
    --gradient-hero: linear-gradient(135deg, hsl(240 68% 58%), hsl(260 58% 62%));
    --gradient-subtle: linear-gradient(180deg, hsl(220 25% 98%), hsl(240 40% 96%));
    --gradient-accent: linear-gradient(120deg, hsl(240 68% 58%), hsl(280 65% 60%));
    
    /* Shadows */
    --shadow-elegant: 0 10px 40px -10px hsl(240 68% 58% / 0.25);
    --shadow-glow: 0 0 40px hsl(245 75% 65% / 0.3);
    --shadow-card: 0 4px 20px hsl(230 30% 12% / 0.08);
    
    /* Animations */
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

    --sidebar-background: 0 0% 98%;

    --sidebar-foreground: 240 5.3% 26.1%;

    --sidebar-primary: 240 5.9% 10%;

    --sidebar-primary-foreground: 0 0% 98%;

    --sidebar-accent: 240 4.8% 95.9%;

    --sidebar-accent-foreground: 240 5.9% 10%;

    --sidebar-border: 220 13% 91%;

    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --background: 230 30% 8%;
    --foreground: 220 20% 96%;

    --card: 230 25% 12%;
    --card-foreground: 220 20% 96%;

    --popover: 230 25% 12%;
    --popover-foreground: 220 20% 96%;

    --primary: 245 75% 65%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 245 85% 70%;

    --secondary: 260 58% 62%;
    --secondary-foreground: 0 0% 100%;

    --muted: 230 20% 16%;
    --muted-foreground: 220 15% 60%;

    --accent: 280 65% 60%;
    --accent-foreground: 0 0% 100%;

    --success: 142 76% 48%;
    --success-foreground: 0 0% 100%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 230 20% 20%;
    --input: 230 20% 20%;
    --ring: 245 75% 65%;
    
    /* Dark mode gradients */
    --gradient-hero: linear-gradient(135deg, hsl(245 75% 65%), hsl(260 58% 62%));
    --gradient-subtle: linear-gradient(180deg, hsl(230 30% 8%), hsl(240 30% 12%));
    --gradient-accent: linear-gradient(120deg, hsl(245 75% 65%), hsl(280 65% 60%));
    
    /* Dark mode shadows */
    --shadow-elegant: 0 10px 40px -10px hsl(245 75% 65% / 0.4);
    --shadow-glow: 0 0 50px hsl(245 85% 70% / 0.4);
    --shadow-card: 0 4px 20px hsl(0 0% 0% / 0.5);
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
  
  /* Custom animations */
  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slide-in-from-bottom {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-in-from-left {
    from {
      transform: translateX(-20px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes zoom-in {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-in {
    animation-fill-mode: both;
  }
  
  .fade-in {
    animation-name: fade-in;
  }
  
  .slide-in-from-bottom {
    animation-name: slide-in-from-bottom;
  }
  
  .slide-in-from-left {
    animation-name: slide-in-from-left;
  }
  
  .zoom-in {
    animation-name: zoom-in;
  }
  
  .duration-300 {
    animation-duration: 300ms;
  }
  
  .duration-500 {
    animation-duration: 500ms;
  }
  
  .duration-700 {
    animation-duration: 700ms;
  }
  
  .delay-100 {
    animation-delay: 100ms;
  }
  
  .delay-200 {
    animation-delay: 200ms;
  }
  
  .delay-300 {
    animation-delay: 300ms;
  }
  
  .delay-400 {
    animation-delay: 400ms;
  }
  
  .delay-500 {
    animation-delay: 500ms;
  }
}
