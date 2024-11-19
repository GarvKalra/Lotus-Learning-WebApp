import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import GeneralNavbar from "../../../../components/navbar/GeneralNavbar";
import saveNotification from "../../../../BackendProxy/notificationProxy/saveNotification";


const AdminSendNotification = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState([]);
  const studentIds = state?.studentIds || [];
  const sender = state?.sender || "";
  console.log(sender);
  const isBulkNotification = studentIds.length > 1;
  const hasFetchedRecipients = useRef(false);

  useEffect(() => {
    // Disable scrolling on mount
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // Re-enable scrolling on unmount
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!studentIds.length) {
      alert("No students selected.");
      navigate("/admin/manage-students");
      return;
    }

    // Only fetch recipients if it hasn't been fetched before
    if (!hasFetchedRecipients.current && studentIds.length) {
      const fetchRecipients = async () => {
        try {
          const response = await axios.post(process.env.REACT_APP_API_URL + 'admin/get-students-by-ids', {
            studentIds,
          });
          setRecipients(response.data.students);
          hasFetchedRecipients.current = true; // Mark as fetched
        } catch (error) {
          console.error("Failed to fetch student details", error);
          alert("Failed to load recipient information.");
        }
      };

      fetchRecipients();
    }
  }, [studentIds, navigate]);

 const handleSend = async () => {
  if (!title || !message) {
    alert("Please fill in both title and message.");
    return;
  }
 

  const notificationData = studentIds.map(studentId => ({
    userId: studentId,
    type: "admin_notification",
    payload: {
      title,
      message,
    },
    senderName: sender,
    status: "unread",
  }));

  try {
    // Call saveNotification with the notification data (array for bulk, single object if one)
    const response = await saveNotification(isBulkNotification ? notificationData : notificationData[0]);
    console.log(response);

    if (response) {
      alert(`Notification sent successfully to ${isBulkNotification ? "selected students" : "the student"}!`);

      await axios.post(process.env.REACT_APP_API_URL + 'admin/send-email-notification', {
        title,
        message,
        recipients: recipients.map(recipient => recipient.email),
      }).catch((error) => {
        console.error("Failed to send email notification:", error);
      });
    } else {
      alert("Failed to send notification.");
    }
  } catch (error) {
    console.error("Failed to send notification", error);
    alert("Failed to send notification. Please try again.");
  }
};
  

  return (
<div className="flex flex-col items-center min-h-screen overflow-hidden">
  <GeneralNavbar />
  <div className="flex-grow w-full max-w-md mt-6 p-4">
    <h1 className="text-xl font-semibold mb-4">
      Send {isBulkNotification ? "Bulk Notification" : "Notification"}
    </h1>

    <div className="mb-4">
      <label className="block text-gray-700 font-medium">Sending To:</label>
      <ul className="list-disc ml-4 mt-2 space-y-1 overflow-y-auto max-h-24 text-base">
        {recipients.map((student) => (
          <li key={student._id} className="text-gray-600">
            {student.username} ({student.email})
          </li>
        ))}
      </ul>
    </div>

    <div className="mb-4">
  <label className="block text-gray-700">Title</label>
  <input
    type="text"
    value={title}
    onChange={(e) => {
      if (e.target.value.length <= 50) {
        setTitle(e.target.value);
      }
    }}
    placeholder="Enter notification title (max 50 characters)"
    className="px-3 py-2 border rounded-md text-base w-full"
  />
</div>

<div className="mb-4">
  <label className="block text-gray-700">Message</label>
  <textarea
    value={message}
    onChange={(e) => {
      if (e.target.value.length <= 250) {
        setMessage(e.target.value);
      }
    }}
    placeholder="Enter notification message (max 250 characters)"
    className="px-3 py-2 border rounded-md text-base w-full h-32"
  ></textarea>
    </div>

    <div className="flex space-x-4">
        <button
          onClick={handleSend}
          className="text-white font-medium px-3 py-1 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
        >
          Send Notification{isBulkNotification && "s"}
        </button>
        <button
          onClick={() => navigate(-1)} // Navigate back to the previous page
          className="text-white font-medium px-3 py-1 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
        >
          Back
        </button>
      </div>
  </div>
</div>
  );
};

export default AdminSendNotification;
