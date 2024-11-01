import React, { useState, useEffect } from "react";
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

    const fetchRecipients = async () => {
      try {
        const response = await axios.post("http://localhost:5000/admin/get-students-by-ids", {
          studentIds,
        });
        setRecipients(response.data.students);
      } catch (error) {
        console.error("Failed to fetch student details", error);
        alert("Failed to load recipient information.");
      }
    };

    fetchRecipients();
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
      senderName:sender,
      status: "unread",
    }));

    try {
      // Call saveNotification with the notification data (array for bulk, single object if one)
      const response = await saveNotification(isBulkNotification ? notificationData : notificationData[0]);
console.log(response);
      if (response) {
        alert(`Notification sent successfully to ${isBulkNotification ? "selected students" : "the student"}!`);
      } else {
        alert("Failed to send notification.");
      }
    } catch (error) {
      console.error("Failed to send notification", error);
      alert("Failed to send notification. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <GeneralNavbar />
      <div className="flex-grow max-w-md mx-auto mt-6 p-4 bg-white shadow-md rounded-md">
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
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title"
            className="w-full px-3 py-2 border rounded-md text-base"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter notification message"
            className="w-full px-3 py-2 border rounded-md text-base"
            rows="4"
          ></textarea>
        </div>

        <button
          onClick={handleSend}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 text-base"
        >
          Send Notification{isBulkNotification && "s"}
        </button>
      </div>
    </div>
  );
};

export default AdminSendNotification;
