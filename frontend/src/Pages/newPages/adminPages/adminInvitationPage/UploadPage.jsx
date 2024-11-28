import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GeneralNavbar from "../../../../components/navbar/GeneralNavbar";
import BlobComposition from "../../../../components/backgrounds/BlobComposition/BlobComposition";
import { FaSortAlphaDownAlt } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import Pagination from "../../Profile/Pagination";
import { useLocation } from "react-router-dom";
import axios from "axios";


const UploadPage = () => {
  const location = useLocation();
  const { uploadId } = useParams(); // Get uploadId from the URL
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Limit per page
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { fileName } = location.state || {}; // Get fileName from the state


  useEffect(() => {
    fetchUsers();
  }, [uploadId]); // Fetch all users when uploadId changes

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}api/preUser/files/${uploadId}/preUsers`
      );
      setUsers(response.data.preUsers); // Set all users

    
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to fetch users.");
    }
  };

  const handleSort = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
    setCurrentPage(1); // Reset to the first page
  };

  // Apply filters and sorting
  const filteredUsers = users.filter((user) => {
    if (filterStatus !== "All" && user.status !== filterStatus) return false;
    if (!user.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const sortedUsers = filteredUsers.sort((a, b) => {
    return sortDirection === "asc"
      ? a.email.localeCompare(b.email)
      : b.email.localeCompare(a.email);
  });

  const deleteSelectedUsersAndEnrollments = async () => {

    if (!window.confirm("Are you sure you want to delete the selected files?")) {
      return;
    }
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}api/preUser/files/${uploadId}/delete-preUsers`,
        { emails: selectedUsers }
      );
  
      if (response.status === 200) {
        alert(response.data.message);
        setSelectedUsers([]); // Clear selected users
        await fetchUsers(); // Refresh the user list
  
        // Check if the current page is now empty
        const remainingUsers = users.length - selectedUsers.length;
        const newTotalPages = Math.ceil(remainingUsers / itemsPerPage);
  
        // If the current page exceeds total pages, move to the previous page
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(newTotalPages, 1)); // Go to previous valid page or page 1
        }
      }
    } catch (error) {
      console.error("Error deleting selected users and enrollments:", error);
      alert("Failed to delete selected users and enrollments.");
    }
  };

  // Paginate users
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleUserSelection = (email) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(email)
        ? prevSelected.filter((selected) => selected !== email) 
        : [...prevSelected, email] 
    );
  };

  return (
    <div className="relative h-full">
      <GeneralNavbar />
      <BlobComposition
        blobsData={[
          { top: "10%", left: "-20%", size: "700px" },
          { top: "-30%", left: "70%", size: "400px" },
          { top: "40%", left: "50%", size: "300px" },
        ]}
      />

      <div className="m-auto max-w-[1200px] mt-3 min-h-[100vh]">
        <div className="bg-white rounded-full flex justify-between items-center py-2 px-4">
        <div className="flex items-center space-x-3">
       <p> Uploaded File:</p>  <div className="text-blue-500">{fileName}</div>
        </div>
  

          <div className="flex items-center space-x-3">
          <button
      onClick={deleteSelectedUsersAndEnrollments}
      disabled={selectedUsers.length === 0} // Disable if no users are selected
      className={`px-4 py-2 rounded-full font-semibold text-white ${
        selectedUsers.length > 0 ? "bg-red-500 hover:bg-red-600" : "bg-gray-300"
      }`}
    >
      Delete Selected
    </button>
            <select
              value={filterStatus}
              onChange={handleFilterStatusChange}
              className="text-sm border px-2 py-1 rounded-full"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
            </select>
            <button
              onClick={handleSort}
              className="cursor-pointer hover:bg-stone-100 p-2 rounded-full transition-all"
              aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
            >
              <FaSortAlphaDownAlt
                className={`text-stone-800 transform ${
                  sortDirection === "desc" ? "rotate-180" : ""
                }`}
              />
            </button>
            <div className="flex items-center">
              <input
                placeholder="Search by email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm focus:outline-none focus:border-b-stone-400 border-b-transparent border-b-[1.5px] pr-2 py-1 font-medium text-stone-600"
              />
              <IoMdSearch />
            </div>
          </div>
        </div>


        <div className="bg-white py-2 px-4 my-3 rounded-lg">
        <table className="table-auto w-full">
  <thead>
    <tr>
      <th className="text-left">
      <input
  type="checkbox"
  onChange={(e) => {
    if (e.target.checked) {
      // Add current page users to selectedUsers
      const newSelections = currentUsers.map((user) => user.email);
      setSelectedUsers((prevSelected) => [
        ...prevSelected,
        ...newSelections.filter((email) => !prevSelected.includes(email)), // Avoid duplicates
      ]);
    } else {
      // Remove current page users from selectedUsers
      const deselected = currentUsers.map((user) => user.email);
      setSelectedUsers((prevSelected) =>
        prevSelected.filter((email) => !deselected.includes(email))
      );
    }
  }}
  checked={
    currentUsers.length > 0 &&
    currentUsers.every((user) => selectedUsers.includes(user.email))
  }
/>
      </th>
      <th className="text-left">Email</th>
      <th className="text-left">Sent on</th>
      <th className="text-end">Status</th>
    </tr>
  </thead>
  <tbody className="text-sm">
    {currentUsers.map((user, index) => (
      <tr key={index} className="border-b">
        <td className="py-2">
          <input
            type="checkbox"
            checked={selectedUsers.includes(user.email)}
            onChange={() => toggleUserSelection(user.email)}
          />
        </td>
        <td className="py-2">{user.email}</td>
        <td className="py-2">{new Date(user.sentOn).toLocaleString()}</td>
        <td className="py-2">
          <div className="flex justify-end">
            <div
              className={`px-2 py-1 text-sm flex items-center justify-center ${
                user.status === "Accepted" ? "bg-green-500" : "bg-yellow-500"
              } rounded-full`}
            >
              <p
                className={`font-medium ${
                  user.status === "Accepted"
                    ? "text-green-100"
                    : "text-yellow-100"
                }`}
              >
                {user.status}
              </p>
            </div>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
          {sortedUsers.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No students found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
