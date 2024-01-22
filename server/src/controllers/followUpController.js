const { default: mongoose } = require("mongoose");
const FollowUp = require("../models/followUp");
const Status = require("../models/status");
const User = require("../models/user");

//get all followUps
async function getFollowUps(req, res) {
  try {
    const follow_up = await FollowUp.find();
    res.status(200).json(follow_up);
  } catch (error) {
    console.log("Error fetchong follow_up", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//add new followup
async function addFollowUp(req, res) {
  const { lead_id, user_id, status, comment } = req.body;

  //check if lead exist ini lead table
  if (!mongoose.Types.ObjectId.isValid(lead_id)) {
    res.status(400).json({ error: "no such lead" });
  }

  //check if status exists in status table
  const status_document = await Status.findOne({ name: status });
  if (!status_document) {
    res.status(400).json({ error: `Status not found: ${status}` });
  }

  //check if user exist in user table
  if (!mongoose.Types.ObjectId.isValid(user_id)) {
    res.status(400).json({ error: "no such user" });
  }

  //current datetime
  const currentDateTime = new Date();

  try {
    const newFollowUp = await FollowUp.create({
      lead_id: lead_id,
      user_id: user_id,
      status_id: status_document._id,
      comment,
      date: currentDateTime,
    });
    res.status(200).json(newFollowUp);
  } catch (error) {
    console.log("Error adding followup", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//update followup
async function updateFollowUp(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ error: "no such follow up" });
  }

  const followup = await FollowUp.findByIdAndUpdate(
    { _id: id },
    {
      ...req.body,
    }
  );

  if (!followup) {
    res.status(400).json({ error: "no such follow up" });
  }

  res.status(200).json(followup);
}

//get followup
async function getFollowUp(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ error: "No such followup" });
  }

  const followup = await FollowUp.findById({ _id: id });

  if (!followup) {
    res.status(400).json({ error: "No such followup" });
  }

  res.status(200).json(followup);
}

function formatDate(inputDate) {
  const date = new Date(inputDate);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  const formattedD = `${year}-${month}-${day}`;
  return formattedD;
}

async function getFollowUpsByLead(req, res) {
  const { lead_id } = req.params;

  try {
    const followUps = await FollowUp.find({ lead_id })
      .sort({ date: -1 })
      .exec();

    const followUpDetails = [];

    for (const follwoup of followUps) {
      const user = await User.findOne({ _id: follwoup.user_id });
      const status = await Status.findOne({ _id: follwoup.status_id });
      const followupDetail = {
        comment: follwoup.comment,
        date: formatDate(follwoup.date),
        status: status ? status.name : null,
        user: user ? user.name : null,
      };

      followUpDetails.push(followupDetail);
    }
    res.status(200).json(followUpDetails);
  } catch (error) {
    console.log("Error fetching follow-ups by lead_id", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

//get followup by lead id leatest date
async function getFollowUpDate(req, res) {
  try {
    const follow_up = await FollowUp.find().populate("status_id").exec();

    // Grouping follow_up data based on lead_id
    const groupedFollowUp = follow_up.reduce((acc, followUpItem) => {
      const leadId = followUpItem.lead_id;

      if (!acc[leadId]) {
        acc[leadId] = [];
      }

      acc[leadId].push(followUpItem);
      return acc;
    }, {});

    // Filtering the latest date within each group
    const filteredFollowUp = Object.keys(groupedFollowUp).reduce(
      (result, leadId) => {
        const group = groupedFollowUp[leadId];
        const latestItem = group.reduce((latest, currentItem) => {
          return latest.date > currentItem.date ? latest : currentItem;
        });

        result[leadId] = latestItem;
        return result;
      },
      {}
    );

    // Counting the number of items with name
    const ringNoAnswerCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Ring no answer"
    ).length;
    const registeredCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Registered"
    ).length;
    const emailCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Sent Email"
    ).length;
    const whatsappCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Whatsapp & sms"
    ).length;
    const meetingCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Schedule meetings"
    ).length;
    const cousedetailsCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Couse details sent"
    ).length;
    const nextintakeCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Next intake"
    ).length;
    const droppedCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Dropped"
    ).length;
    const fakeCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Fake"
    ).length;
    const duplicateCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Duplicate"
    ).length;
    const NewCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "New"
    ).length;

    const resultCount = {
      ringNoAnswerCount: ringNoAnswerCount,
      registeredCount: registeredCount,
      emailCount: emailCount,
      whatsappCount: whatsappCount,
      meetingCount: meetingCount,
      cousedetailsCount: cousedetailsCount,
      nextintakeCount: nextintakeCount,
      droppedCount: droppedCount,
      fakeCount: fakeCount,
      duplicateCount: duplicateCount,
      NewCount: NewCount,
    };

    // console.log(resultCount);

    res.status(200).json(resultCount);
  } catch (error) {
    console.log("Error fetching follow_up", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// get folloup by lead id leatest date by user id
async function getFollowUpDateByUser(req, res) {
  const { user_id } = req.params;
  try {
    const follow_up = await FollowUp.find({ user_id })
      .populate("status_id")
      .exec();

    // Grouping follow_up data based on lead_id
    const groupedFollowUp = follow_up.reduce((acc, followUpItem) => {
      const leadId = followUpItem.lead_id;

      if (!acc[leadId]) {
        acc[leadId] = [];
      }

      acc[leadId].push(followUpItem);
      return acc;
    }, {});

    // Filtering the latest date within each group
    const filteredFollowUp = Object.keys(groupedFollowUp).reduce(
      (result, leadId) => {
        const group = groupedFollowUp[leadId];
        const latestItem = group.reduce((latest, currentItem) => {
          return latest.date > currentItem.date ? latest : currentItem;
        });

        result[leadId] = latestItem;
        return result;
      },
      {}
    );

    // Counting the number of items with name
    const ringNoAnswerCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Ring no answer"
    ).length;
    const registeredCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Registered"
    ).length;
    const emailCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Sent Email"
    ).length;
    const whatsappCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Whatsapp & sms"
    ).length;
    const meetingCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Schedule meetings"
    ).length;
    const cousedetailsCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Couse details sent"
    ).length;
    const nextintakeCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Next intake"
    ).length;
    const droppedCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Dropped"
    ).length;
    const fakeCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Fake"
    ).length;
    const duplicateCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "Duplicate"
    ).length;
    const NewCount = Object.values(filteredFollowUp).filter(
      (item) => item.status_id.name === "New"
    ).length;

    const resultCount = {
      ringNoAnswerCount: ringNoAnswerCount,
      registeredCount: registeredCount,
      emailCount: emailCount,
      whatsappCount: whatsappCount,
      meetingCount: meetingCount,
      cousedetailsCount: cousedetailsCount,
      nextintakeCount: nextintakeCount,
      droppedCount: droppedCount,
      fakeCount: fakeCount,
      duplicateCount: duplicateCount,
      NewCount: NewCount,
    };

    // console.log(resultCount);

    res.status(200).json(resultCount);
  } catch (error) {
    console.log("Error fetching follow_up", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

module.exports = {
  getFollowUps,
  addFollowUp,
  updateFollowUp,
  getFollowUp,
  getFollowUpsByLead,
  getFollowUpDate,
  getFollowUpDateByUser,
};
