import { motion } from "framer-motion";
import { BookOpen, Calendar, ArrowRight } from "lucide-react";

const posts = [
  {
    title: "How Sangam Wholesale is Empowering Small Retailers",
    date: "July 20, 2026",
    tag: "Business",
    summary:
      "Discover how our platform connects small retailers with top FMCG brands at wholesale prices, reducing the supply chain gap across India.",
  },
  {
    title: "Top 5 Benefits of Buying Wholesale Online",
    date: "June 15, 2026",
    tag: "Tips",
    summary:
      "From better margins to faster delivery, learn why thousands of retailers are switching to digital wholesale sourcing with Sangam Wholesale.",
  },
  {
    title: "New Categories Now Available on Sangam Wholesale",
    date: "May 10, 2026",
    tag: "Update",
    summary:
      "We've expanded our catalog with new product categories including personal care, household essentials, and more — all at competitive wholesale rates.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Banner — same as Privacy/Terms/Return */}
      <div className="bg-[#702834] text-white py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Blog</h1>
          <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base">
            News, updates, and insights from the Sangam Wholesale team.
          </p>
        </motion.div>
      </div>

      {/* Posts */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="space-y-6">
          {posts.map((post, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Card header bar */}
              <div className="flex items-center gap-3 px-6 py-4 bg-[#702834]/5 border-b border-gray-100">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#702834] text-white flex-shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-base md:text-lg font-bold text-gray-800">
                  {post.title}
                </h2>
              </div>

              {/* Card body */}
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#702834" }}>
                    {post.tag}
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{post.summary}</p>
                <button
                  className="mt-4 flex items-center gap-1 text-sm font-semibold transition-colors"
                  style={{ color: "#702834" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#5a1f29")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#702834")}
                >
                  Read more <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
