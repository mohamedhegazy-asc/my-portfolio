import mongoose from 'mongoose'

const toolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String, required: true }
}, { _id: false })

const profileSchema = new mongoose.Schema({
    name: { type: String, required: true, default: "Mohamed Mahmoud Hegazy" },
    shortName: { type: String, required: true, default: "Mohamed" },
    initials: { type: String, required: true, default: "mmh" },
    title: { type: String, required: true, default: "Data Analyst & AI Enthusiast" },
    country: { type: String, required: true, default: "Egypt, Gharbia - Zifta" },
    birthDate: { type: String, default: "2003-01-16" },
    bio: { type: String, required: true, default: "Data Analyst and Business Information Systems graduate from Misr Higher Institute for Commerce and Computers (MET - Mansoura). Passionate about Data Analysis, AI, Vibe Coding, and leveraging modern analytical and development tools to turn raw data into strategic business insights." },
    avatarUrl: { type: String, default: "/assets/avatar.jpg" },
    heroImageUrl: { type: String, default: "/assets/mohamed_hero.jpg" },
    cvUrl: { type: String, default: "/Mohamed_Hegazy_CV.pdf" },
    socials: {
        github: { type: String, default: "https://github.com/mohamedhegazy" },
        linkedin: { type: String, default: "https://linkedin.com/in/mohamedhegazy" },
        email: { type: String, default: "mohamed12hegazy11@gmail.com" },
        phone: { type: String, default: "+20 101 511 2428" },
        location: { type: String, default: "Zifta, Gharbia, Egypt" }
    },
    tools: [toolSchema]
}, { timestamps: true })

export const Profile = mongoose.models.Profile || mongoose.model('Profile', profileSchema)
