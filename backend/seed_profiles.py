import asyncio
import random
from app.database import async_session
from app.models.models import Profile

FIRST_NAMES = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Sai", "Arnav", "Dhruv", "Kabir",
    "Ritvik", "Sahil", "Kartik", "Ishaan", "Rohan", "Nikhil", "Ankit", "Harsh", "Pranav", "Gaurav",
    "Manish", "Rahul", "Varun", "Kunal", "Abhishek", "Rajat", "Siddharth", "Tarun", "Vikram", "Yash",
    "Aaradhya", "Ananya", "Diya", "Isha", "Kavya", "Myra", "Priya", "Riya", "Saanvi", "Tanvi",
    "Aisha", "Bhavna", "Deepika", "Ekta", "Gauri", "Hema", "Jaya", "Komal", "Lata", "Meena",
    "Nandini", "Pallavi", "Rashmi", "Sonal", "Tanya", "Urmila", "Vidya", "Yamini", "Zara", "Neha",
]

LAST_NAMES = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi", "Mishra", "Chauhan", "Yadav",
    "Reddy", "Nair", "Iyer", "Desai", "Shah", "Mehta", "Kapoor", "Malhotra", "Bhat", "Rao",
    "Pandey", "Tiwari", "Dubey", "Saxena", "Agarwal", "Bansal", "Chopra", "Dhawan", "Goyal", "Jain",
]

FATHER_FIRST = [
    "Rajesh", "Suresh", "Mahesh", "Ramesh", "Dinesh", "Mukesh", "Naresh", "Ganesh", "Yogesh", "Hitesh",
    "Anil", "Sunil", "Vijay", "Sanjay", "Ajay", "Manoj", "Pramod", "Vinod", "Ashok", "Rakesh",
]

MOTHER_FIRST = [
    "Sunita", "Anita", "Geeta", "Seema", "Neeta", "Rita", "Meena", "Reena", "Sushma", "Poonam",
    "Kamla", "Savita", "Rekha", "Shobha", "Kiran", "Asha", "Usha", "Sarla", "Kusum", "Pushpa",
]

EDUCATIONS = [
    "B.Tech Computer Science", "B.Tech Information Technology", "B.Tech Electronics",
    "BCA", "MCA", "M.Tech Computer Science", "B.Sc Computer Science", "M.Sc IT",
    "BE Computer Engineering", "BE Information Technology", "B.Tech Mechanical",
    "MBA", "BBA", "B.Com", "BA Economics",
]

SKILLS_POOL = [
    "React", "Angular", "Vue.js", "Node.js", "Python", "Django", "FastAPI", "Flask",
    "Java", "Spring Boot", "Kotlin", "Go", "Rust", "C++", "C#", ".NET",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform",
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch",
    "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS",
    "GraphQL", "REST API", "Microservices", "CI/CD", "Git",
    "Machine Learning", "Data Science", "Pandas", "TensorFlow", "PyTorch",
    "Swift", "Flutter", "React Native", "Figma", "SQL",
]

COMPANIES = [
    "TCS", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra",
    "Cognizant", "Accenture", "Capgemini", "Mindtree", "Mphasis",
    "Zoho", "Freshworks", "Razorpay", "Zerodha", "CRED",
    "Flipkart", "Swiggy", "Zomato", "Ola", "PhonePe",
    "Paytm", "Byju's", "Unacademy", "Dream11", "Meesho",
    "Google India", "Microsoft India", "Amazon India", "Adobe India", "Oracle India",
    "Samsung R&D", "Qualcomm India", "Intel India", "IBM India", "Deloitte India",
    None, None, None,
]

DESIGNATIONS = [
    "Software Engineer", "Senior Software Engineer", "Lead Developer",
    "Full Stack Developer", "Frontend Developer", "Backend Developer",
    "DevOps Engineer", "Data Engineer", "Data Analyst", "ML Engineer",
    "QA Engineer", "Product Manager", "Associate Consultant",
    "Software Developer", "System Engineer", "Technical Analyst",
    "Junior Developer", "Intern", "Trainee", "Associate Software Engineer",
]


def generate_profiles(count=120):
    profiles = []
    used_emails = set()

    for i in range(count):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"

        email_base = f"{first.lower()}.{last.lower()}"
        email = f"{email_base}{random.randint(1, 999)}@example.com"
        while email in used_emails:
            email = f"{email_base}{random.randint(1, 9999)}@example.com"
        used_emails.add(email)

        phone = f"9{random.randint(100000000, 999999999)}"
        father_name = f"{random.choice(FATHER_FIRST)} {last}"
        mother_name = f"{random.choice(MOTHER_FIRST)} {last}"

        year = random.randint(1990, 2002)
        month = random.randint(1, 12)
        day = random.randint(1, 28)
        dob = f"{year}-{month:02d}-{day:02d}"

        education = random.choice(EDUCATIONS)
        passout_year = str(random.randint(2012, 2025))
        exp_years = random.randint(0, 12)
        experience = f"{exp_years} year{'s' if exp_years != 1 else ''}" if exp_years > 0 else "Fresher"

        num_skills = random.randint(3, 7)
        skills = ", ".join(random.sample(SKILLS_POOL, num_skills))

        aadhaar = f"XXXX-XXXX-{random.randint(1000, 9999)}"
        pan_letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=5))
        pan_digits = f"{random.randint(1000, 9999)}"
        pan_last = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
        pan = f"{pan_letters}{pan_digits}{pan_last}"

        company = random.choice(COMPANIES)
        designation = random.choice(DESIGNATIONS) if company else None

        profiles.append(Profile(
            name=name,
            email=email,
            phone=phone,
            father_name=father_name,
            mother_name=mother_name,
            dob=dob,
            education=education,
            passout_year=passout_year,
            experience=experience,
            skills=skills,
            aadhaar=aadhaar,
            pan=pan,
            current_company=company,
            designation=designation,
        ))

    return profiles


async def main():
    profiles = generate_profiles(120)
    async with async_session() as db:
        db.add_all(profiles)
        await db.commit()
    print(f"Inserted {len(profiles)} profiles.")


if __name__ == "__main__":
    asyncio.run(main())
