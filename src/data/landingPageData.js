export const landingPageData = {
  navigation: {
    links: [
      { name: 'Home', to: '/' },
      // { name: 'Products', to: '/products' },
      { name: 'About', to: '#about' },
      { name: 'Contact Us', to: '/contact' }
    ]
  },

  about: {
    title: "About D&Sspice",
    description: "For generations, African kitchens have relied on locust beans to bring warmth, richness, and authenticity to their meals. At D&Sspice, we are proud to continue this legacy by providing you with the best quality locust beans, sourced with care and delivered with love.",
    mission: "Cooking isn't just about feeding the body it's about celebrating culture, creating memories, and savoring every bite. Let D&Sspice be part of your kitchen, your heritage, your story, and your journey to extraordinary flavors.",
    imageSrc: "images/aboutBanner.jpeg",
    values: [
      {
        title: "Tradition",
        description: "Preserving authentic African flavors and cooking methods",
        icon: "🏺"
      },
      {
        title: "Quality",
        description: "Carefully sourced, naturally fermented, and sun-dried to perfection",
        icon: "⭐"
      },
      {
        title: "Sustainability",
        description: "Supporting local communities and eco-friendly practices",
        icon: "🌱"
      },
      {
        title: "Innovation",
        description: "Bringing traditional flavors to modern kitchens",
        icon: "💡"
      }
    ]
  },

  features: {
    items: [
      {
        title: "100% Natural & Organic",
        description: "We believe the best flavors come straight from nature. Our locust beans are pure, sandfree, and completely free from artificial additives or preservatives.",
        imageSrc: "images/featureImg5.jpg",
        imageAlt: "Natural and organic locust beans",
        icon: "SparklesIcon"
      },
      {
        title: "Rich, Bold Flavor That Transforms Your Cooking",
        description: "Imagine the deep, smoky aroma of locust beans enhancing your favorite dishes Egusi soup, Efo Riro, Okro, Native Jollof rice, Banga soup, and more!",
        imageSrc: "images/featureImg2.jpeg",
        imageAlt: "Traditional African dishes",
        icon: "FireIcon"
      },
      {
        title: "Nutrient-Packed Superfood",
        description: "Beyond taste, our dried locust beans are a powerhouse of nutrition, high in protein, rich in fiber, loaded with antioxidants, and a natural source of vitamins and minerals.",
        imageSrc: "images/featureImg3.jpeg",
        imageAlt: "Nutritional benefits illustration",
        icon: "BoltIcon"
      },
      {
        title: "Fast, Reliable & Hassle-Free Delivery",
        description: "We ensure quick, efficient, and fresh delivery straight to your doorstep anywhere in the UK. No delays, no stress, just premium locust beans ready to elevate your cooking.",
        imageSrc: "images/featureImg4.jpeg",
        imageAlt: "Premium packaging and delivery",
        icon: "TruckIcon"
      }
    ]
  },

  testimonials: {
    items: [
      {
        quote: "The best locust beans I've ever bought! The aroma is deep, rich, and authentic. My Egusi soup has never tasted better!",
        author: "Glasgow, Scotland, UK",
        imageSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&h=200"
      },
      {
        quote: "I was skeptical about ordering locust beans online, but D&Sspice changed my mind. Super fresh and so flavorful! Fast delivery too.",
        author: "Michael T., London, England, UK",
        imageSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200"
      },
      {
        quote: "This takes me back to my childhood. My grandmother used to cook with Iru all the time, and D&Sspice brings that same unforgettable taste.",
        author: "Fatima S., Manchester, England, UK",
        imageSrc: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&h=200"
      },
      {
        quote: "I run a restaurant, and quality ingredients make all the difference. D&Sspice's locust beans are a game-changer. My customers love it!",
        author: "Chef Ade, Leicester, England, UK",
        imageSrc: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&h=200"
      }
    ]
  },

  hero: {
    title: "Bringing the Heart of African Flavor to Your Kitchen!",
    subtitle: "Premium Dried Locust Beans for the Ultimate Taste Experience",
    backgroundImage: "/images/products/Dried-locust-beans-150g.jpg",
    cta: {
      primary: {
        text: "Shop Now",
        href: "/products"
      },
      secondary: {
        text: "Learn more",
        href: "#learn-more",
        lightTheme: "dark"
      }
    }
  }
}

export default landingPageData; 