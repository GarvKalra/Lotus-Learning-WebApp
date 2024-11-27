import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import GeneralNavbar from "../../../../components/navbar/GeneralNavbar";
import BlobComposition from "../../../../components/backgrounds/BlobComposition/BlobComposition";
import { FaSortAlphaDownAlt } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import Pagination from "../../Profile/Pagination";
import axios from "axios";

const UploadPage = () => {
  const { uploadId } = useParams(); // Get uploadId from the URL
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Limit per page

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

  // Paginate users
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const currentUsers = sortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <p className="font-semibold text-lg">Uploaded File Students</p>
          <div className="flex items-center space-x-3">
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
                <th className="text-left">Email</th>
                <th className="text-left">Sent on</th>
                <th className="text-end">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {currentUsers.map((user, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">
                    {new Date(user.sentOn).toLocaleString()}
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end">
                      <div
                        className={`px-2 py-1 text-sm flex items-center justify-center ${
                          user.status === "Accepted"
                            ? "bg-green-500"
                            : "bg-yellow-500"
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
