const Lead = require("../models/lead");
const Course = require("../models/course");
const Branch = require("../models/branch");
const Source = require("../models/source");
const Student = require("../models/student");
const FollowUp = require("../models/followUp");
const { default: mongoose } = require("mongoose");
const User = require("../models/user");

//get all leads
async function getLeads(req, res) {
  try {
    const leads = await Lead.find();
    res.status(200).json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Sserver Error" });
  }
}

//get one lead
async function getLead(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such lead" });
  }

  const lead = await Lead.findById({ _id: id });

  if (!lead) {
    res.status(400).json({ error: "No such lead" });
  }

  res.status(200).json(lead);
}

//add new lead
async function addLead(req, res) {
  try {
    const { date, sheduled_to, course_name, branch_name, student_id, user_id } = req.body;

    // Check if course_name exists in the course table
    const course_document = await Course.findOne({ name: course_name });
    if (!course_document) {
      return res.status(400).json({ error: `Course not found: ${course_name}` });
    }

    // Check if branch_name exists in the branch table
    const branch_document = await Branch.findOne({ name: branch_name });
    if (!branch_document) {
      return res.status(400).json({ error: `Branch not found: ${branch_name}` });
    }

    // Current datetime
    const currentDateTime = new Date();

    // Check if student exists in the student table
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      return res.status(400).json({ error: "No such student" });
    }

    // Check if user exists in the user table
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({ error: "No such user" });
    }

    // Check if source name exists in the source table
    const source_document = await Source.findOne({ name: 'manual' });
    if (!source_document) {
      return res.status(400).json({ error: `Source not found: manual` });
    }

    let counselor_id = null;

    const leastAllocatedCounselor = await getLeastAllocatedCounselor();

    if (leastAllocatedCounselor) {
      counselor_id = leastAllocatedCounselor.counselor_id;
    } else {
      console.log("No counselor available");
    }

    // Create new lead
    const newLead = await Lead.create({
      date: date,
      sheduled_at: currentDateTime,
      scheduled_to: sheduled_to,
      course_id: course_document._id,
      branch_id: branch_document._id,
      student_id: student_id,
      user_id: user_id,
      counselor_id: counselor_id,
      source_id: source_document._id
    });

    // Send success response
    res.status(200).json(newLead);

  } catch (error) {
    // Log error
    console.log("Error adding leads:", error);
    
    // Send internal server error response
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//update lead
async function updateLead(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such lead" });
  }

  const lead = await Lead.findByIdAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!lead) {
    res.status(400).json({ error: "no such lead" });
  }

  res.status(200).json(lead);
}

// get all leads from database (should retrive details that related to referenced tables and latest follwo up status)
async function getLeadsSummaryDetails(req, res) {
  try {
    const leads = await Lead.find()
      .populate("student_id", "name")
      .populate("course_id", "name")
      .populate("branch_id", "name")
      .populate("counsellor_id", "name")
      .populate("source_id", "name")
      .exec();

    const leadsDetails = [];

    for (const lead of leads) {
      // Find the latest follow-up for the current lead
      const latestFollowUp = await FollowUp.findOne({ lead_id: lead._id })
        .sort({ date: -1 })
        .populate("status_id", "name")
        .exec();

      // Process lead and latest follow-up
      const leadDetail = {
        id: lead._id,
        date: lead.date,
        scheduled_at: lead.scheduled_at ? formatDate(lead.scheduled_at) : null,
        scheduled_to: lead.scheduled_to ? formatDate(lead.scheduled_to) : null,
        name: lead.student_id.name,
        contact_no: lead.student_id.contact_no,
        course: lead.course_id.name,
        branch: lead.branch_id.name,
        source: lead.source_id ? lead.source_id.name : null,
        counsellor: lead.counsellor_id ? lead.counsellor_id.name : null,
        counsellor_id: lead.counsellor_id ? lead.counsellor_id._id : null,
        user_id: lead.user_id? lead.user_id : null,
        status: latestFollowUp ? latestFollowUp.status_id.name : null,
      };

      leadsDetails.push(leadDetail);
    }

    res.status(200).json(leadsDetails);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function formatDate(inputDate) {
  const date = new Date(inputDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const formattedD = `${year}-${month}-${day}`;
  return formattedD;
}
//get one lead
async function getOneLeadSummaryDetails(req, res) {
  const { id } = req.params;
  try {
    const lead = await Lead.findById({ _id: id })
      .populate("course_id", "name")
      .populate("branch_id", "name")
      .exec();

    // Find the latest follow-up for the current lead
    const latestFollowUp = await FollowUp.findOne({ lead_id: id })
      .sort({ date: -1 })
      .populate("status_id", "name")
      .exec();

    const student = await Student.findById({ _id: lead.student_id })


    // Process lead and latest follow-up
    const leadDetail = {
      id: lead._id,
      date: formatDate(student.dob),
      scheduled_at: formatDate(lead.scheduled_at),
      scheduled_to: formatDate(lead.scheduled_to),
      name: student.name,
      contact_no: student.contact_no,
      dob: formatDate(student.dob),
      email: student.email,
      student_id: student._id,
      address: student.address,
      course: lead.course_id.name,
      branch: lead.branch_id.name,
      status: latestFollowUp ? latestFollowUp.status_id.name : null,
      comment: latestFollowUp ? latestFollowUp.comment : null,
    };


    console.log(leadDetail);
    res.status(200).json(leadDetail);
  } catch (error) {
    console.error("Error fetching leads:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function checkForDuplicate(req, res) {
  const { courseName, branchName, studentName, contactNo } = req.query;

  try {
    // Find the course and branch IDs based on their names
    const course = await Course.findOne({ name: courseName });
    const branch = await Branch.findOne({ name: branchName });

    // Find the student based on name and contact number
    const student = await Student.findOne({ name: studentName, contact_no: contactNo });

    if (!course || !branch || !student) {
      return res.status(200).json({ isDuplicate: false, message: 'Incomplete information provided.' });
    }

    // Check for duplicate lead based on course, branch, and student IDs
    const duplicateLead = await Lead.findOne({
      course_id: course._id,
      branch_id: branch._id,
      student_id: student._id,
    });

    return res.status(200).json({ isDuplicate: !!duplicateLead }); // Returns true if a duplicate lead is found, false otherwise
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error checking for duplicate:', error);
    return res.status(500).json({ error: 'Internal server error' })
  }
}

async function allocateLeadsToCounselors() {
  try {
    const leastAllocatedCounselor = await getLeastAllocatedCounselor();
    console.log(leastAllocatedCounselor.counselor_id)
    const twoHoursAgo = new Date(Date.now() - 60 * 60 * 2 * 1000); // Calculate the time two hours ago

    // Find leads in the "new" status without a counsellor assigned within the last two hours
    const unallocatedLeads = await Lead.find({
      date: { $lt: twoHoursAgo },
      counsellor_id: { $exists: false },
    });

    // Allocate each unallocated lead to a counsellor
    for (const lead of unallocatedLeads) {
      // Allocate the lead to a counsellor
      const leastAllocatedCounselor = await getLeastAllocatedCounselor();
      console.log(leastAllocatedCounselor.counselor_id)
      if (leastAllocatedCounselor) {
        lead.counsellor_id = leastAllocatedCounselor.counselor_id;
        await lead.save();

      } else {
        console.log('No counselors found.');
      }
    }

    console.log('Lead allocation process completed.');
  } catch (error) {
    console.error('Error allocating leads:', error);
  }
}

setInterval(allocateLeadsToCounselors,60000);


async function getLeastAllocatedCounselor() {
  try {
    // Aggregate to find the least allocated counselor
    const leastAllocatedCounselor = await Lead.aggregate([
      {
        $group: {
          _id: "$counsellor_id",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users', // The name of the User model collection in your database
          localField: "_id",
          foreignField: "_id",
          as: "counselor",
        },
      },
      {
        $unwind: "$counselor",
      },
      {
        $sort: { count: 1 }, // Sort by the number of leads in ascending order
      },
      {
        $limit: 1, // Get only the counselor with the least leads
      },
      {
        $project: {
          counselor_id: "$counselor._id",
          counselor_name: "$counselor.name",
          lead_count: "$count",
        },
      },
    ]);

    if (leastAllocatedCounselor.length > 0) {
      console.log(leastAllocatedCounselor[0])
      return leastAllocatedCounselor[0];
    } else {
      return null;
    }
  } catch (error) {
    // Handle any errors that occur during the process
    console.error('Error finding least allocated counselor:', error);
    throw new Error('Internal server error');
  }
}

module.exports = {
  getLeads,
  addLead,
  getLead,
  updateLead,
  getLeadsSummaryDetails,
  checkForDuplicate,
  getOneLeadSummaryDetails,
};
