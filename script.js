const syllabusData = {
    title: "INST631 Syllabus",
    subheadings: [
        {
            title: "Fundamentals of Human-Computer Interaction (INST631)",
            subheadings: [
                { 
                    title: "Course Description & Learning Outcomes",
                    details: "The course focuses on understanding the core principles of HCI. Students will learn about user-centered design, usability testing, and more."
                },
                {
                    title: "Required Resources",
                    details: "All materials and resources are available through ELMS electronic resources."
                }
            ]
        },
        {
            title: "General Course-Related Policies for Graduate Students",
            subheadings: [
                { title: "Course Structure", details: "This is a ‘flipped’ classroom course - so you’ll be reading chapters/articles, watching videos/lectures, and doing individual work outside of class. You are expected to complete the videos, readings, and assignments any time before class - use this flexibility to your advantage, so it works for your schedule! There is a deadline for the weekly reading responses, however: you have until midnight before class each week. Attendance & Participation   Our in-person class time will be used for discussions and collaborative work. I will be checking attendance and tracking participation during each class. If you need to miss the discussion due to an illness or similar reason, please contact me as soon as possible! The ‘Blended’ Experience! Having classes that are built across multiple modalities can be wonderful and complicated! So here are some notes about the way that we’ll be navigating the blended nature of this experience.First, both sections will be sharing the same ELMS course space, so deadlines will be listed relationally - e.g., “before class” or “the day before class”. Announcements or notes may be directed specifically to one section or the other - if a section isn’t explicitly mentioned, that means it’s for both! You are expected to track what is due when for your section, and submit on time.Second, there will be a blend of online and offline assignments - for example, the weekly reading responses will be online via ELMS, but other projects and assignments must be printed out and handed in at the start of class. In addition, ELMS assignments may not include all the details for the assignment - instead, details will be discussed in class, so keep good notes! To facilitate good notes, you all have the ability to create and edit files in our shared Google Drive, where this syllabus also lives! (If your umd.edu email doesn’t seem to have access, let me know!)" },
                { title: "Academic Integrity", details: "Students are expected to maintain the highest standards of academic honesty." },
                { title: "Overall Workload Expectations", details: "Students should expect to spend about 10 hours a week on coursework." },
                { title: "Late Assignments", details: "Assignments submitted after the deadline will incur a penalty." },
                { title: "Extra Credit Work", details: "There are no extra credit opportunities in this course." },
                { title: "Course Communication", details: "All communications will be done through ELMS and email." },
                { title: "Getting Support!", details: "Students can reach out to the instructor during office hours or by appointment." },
                { title: "Names/Pronouns and Self-Identifications", details: "The course respects and acknowledges all name and pronoun preferences." },
                { title: "Communication with Peers", details: "Students are encouraged to collaborate, but must submit their own original work." }
            ]
        },
        {
            title: "Assignments and Projects",
            details: "Throughout the semester, students will undertake several assignments and one major project. More details are provided in the respective modules."
        },
        {
            title: "Course Schedule",
            details: "The course schedule, including dates for exams and assignment due dates, is available on the course website."
        },
        {
            title: "Resources & Accommodations",
            subheadings: [
                { title: "Accessibility and Disability Services", details: "Students with disabilities can reach out to the campus Accessibility Services for accommodations." },
                { title: "Student Resources and Services", details: "A variety of student resources are available on campus, including counseling, health services, and more." },
                { title: "Basic Needs Security", details: "The university provides resources for students facing food insecurity, housing issues, etc." },
                { title: "Veteran Resources", details: "Resources and support services are available for veteran students." },
                { title: "Course Evaluation", details: "Students will be given the opportunity to evaluate the course towards the end of the semester." },
                { title: "Thanks to…", details: "Special thanks to all the educators and researchers whose work has contributed to the curriculum." }
            ]
        }
    ]
};


const cloudDiv = d3.select(".cloud");
const primaryTitles = syllabusData.subheadings.map(heading => ({
    title: heading.title,
    subheadings: heading.subheadings
}));

const navigationStack = [];

function updateCloud(currentHeadings) {
    cloudDiv.selectAll(".item").remove();

    cloudDiv.append("div")
        .attr("class", "item main-title")
        .text(syllabusData.title);

    const bubbles = cloudDiv.selectAll(".item:not(.main-title)")
        .data(currentHeadings)
        .enter()
        .append("div")
        .attr("class", "item")
        .text(d => d.title)
        .on("click", function(event, d) {
            if (d.subheadings && d.subheadings.length > 0) {
                navigationStack.push(currentHeadings);
                updateCloud(d.subheadings);
            } else {
                showDetails(d);
            }
        });

    // Apply force layout to move bubbles
    let simulation = d3.forceSimulation(currentHeadings)
        .force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
        .force("charge", d3.forceManyBody().strength(-50))
        .force("collide", d3.forceCollide().radius(function(d) {
            return 50; // Rough size of the div + padding
        }))
        .on("tick", function() {
            bubbles
                .style("top", d => `${d.y}px`)
                .style("left", d => `${d.x}px`);
        });
}

function showDetails(node) {
    cloudDiv.selectAll(".item").remove();

    const detailsBubble = cloudDiv.append("div")
        .attr("class", "details-bubble")
        .text(node.details);

    const editButton = d3.select(".edit-btn").style("display", "block");
    const saveButton = d3.select(".save-btn").style("display", "none");

    editButton.on("click", function() {
        detailsBubble.html(`<textarea id="editableDetails" style="width: 100%; height: 100%;">${node.details}</textarea>`);
        editButton.style("display", "none");
        saveButton.style("display", "block");
    });

    saveButton.on("click", function() {
        const updatedDetails = document.getElementById("editableDetails").value;
        node.details = updatedDetails;
        detailsBubble.text(node.details);
        saveButton.style("display", "none");
        editButton.style("display", "block");
        displayUpcomingDeadline(); // In case we edited the course schedule.
    });
}

function getNextDeadline() {
    const schedule = syllabusData.subheadings.find(item => item.title === "Course Schedule");
    if (!schedule || !schedule.subheadings) return null;

    const currentDate = new Date();
    const upcoming = schedule.subheadings
        .map(event => {
            const deadlineMatch = event.details.match(/Deadline: (\d{4}-\d{2}-\d{2})/);
            if (deadlineMatch) {
                return {
                    topic: event.title,
                    deadline: new Date(deadlineMatch[1])
                };
            }
            return null;
        })
        .filter(event => event && event.deadline > currentDate)
        .sort((a, b) => a.deadline - b.deadline)[0];

    return upcoming;
}

function displayUpcomingDeadline() {
    const upcoming = getNextDeadline();

    if (upcoming) {
        d3.select("#deadlineNotification")
            .text(`Upcoming: ${upcoming.topic} - ${upcoming.deadline.toDateString()}`);
    } else {
        d3.select("#deadlineNotification").text(`No upcoming deadlines.`);
    }
}

document.getElementById("searchInput").addEventListener("input", function(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (!searchTerm) {
        updateCloud(primaryTitles);
        return;
    }

    const filteredItems = syllabusData.subheadings.filter(item => 
        item.title.toLowerCase().includes(searchTerm) || 
        (item.details && item.details.toLowerCase().includes(searchTerm))
    );

    updateCloud(filteredItems);
});

document.getElementById("backButton").addEventListener("click", function() {
    if (navigationStack.length === 0) return;

    d3.select(".details-bubble").remove();

    const lastData = navigationStack.pop();
    updateCloud(lastData);
});

// Initialize with primary titles
updateCloud(primaryTitles);
displayUpcomingDeadline();
