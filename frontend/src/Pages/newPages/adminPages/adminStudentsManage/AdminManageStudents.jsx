import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GeneralNavbar from "../../../../components/navbar/GeneralNavbar";
import BlobComposition from "../../../../components/backgrounds/BlobComposition/BlobComposition";
import { IoMdSearch } from "react-icons/io";
import { RiDeleteBin7Fill, RiEdit2Fill } from "react-icons/ri";
import { FiDownload } from "react-icons/fi";
import { useSelector } from "react-redux";
import OnHoverExtraHud from "../../../../components/OnHoverExtraHud";
import getStudents from "../../../../BackendProxy/adminProxy/getStudents";
import getCoursesByProp from "../../../../BackendProxy/courseProxy/getCoursesByProp";
import getEnrolledCourses from "../../../../BackendProxy/courseProxy/getEnrolledCourses";
import * as XLSX from "xlsx";
import axios from "axios";
import { FiEye, FiEyeOff, FiBell} from "react-icons/fi";
import ProgressBar from "./ProgressBar";
import Pagination from "../../Profile/Pagination";


const AdminManageStudents = () => {
  const authUser = useSelector((state) => state.user);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]); 
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); 
  const itemsPerPage = 3; 
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);


  const navigate = useNavigate();

  const toggleSelectAll = () => {
    if (selectAll) {
      // Deselect all if currently selected
      setSelectedStudents([]);
    } else {
      // Select all students on the current page
      const currentPageStudentIds = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ).map(student => student._id);
      setSelectedStudents(currentPageStudentIds);
    }
    setSelectAll(!selectAll);
  };

  useEffect(() => {
    const currentPageStudentIds = filteredStudents.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ).map(student => student._id);

    const allSelected = currentPageStudentIds.every(id =>
      selectedStudents.includes(id)
    );

    setSelectAll(allSelected);
  }, [selectedStudents, filteredStudents, currentPage, itemsPerPage]);




  
  // Fetch students and courses on load
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await getAllStudents(authUser.institution.code);
        await getAllCourses(authUser.institution.code);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAllData();
  }, [authUser]);

  useEffect(() => {
    const lastPage = Math.ceil(filteredStudents.length / itemsPerPage);
    if (currentPage > lastPage) {
      setCurrentPage(lastPage); // Set currentPage to the last available page
    }
  }, [filteredStudents, itemsPerPage, currentPage]);
  

  useEffect(() => {
    const fetchFilteredStudents = async () => {
      await filterStudents(); 
      setCurrentPage(1);
    };
  
    fetchFilteredStudents(); 
    console.log(filteredStudents); 
  }, [searchTerm, selectedCourse, students]);



  const downloadGradesAsZip = async () => {
    try {
      const response = await axios.post('http://localhost:5000/course/download-zip-students-grades', {
        studentIds: filteredStudents, 
      }, {
        responseType: 'blob', // This ensures you handle the zip file as binary data
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_grades.zip'); // File name for download
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading the zip file:', error);
    }
  };

  const removeStudentFromCourse = async (studentId, studentName) => {
    try {
      const isAllCourses = selectedCourse === "";
  
      const confirmation = window.confirm(
        `Are you sure you want to remove ${studentName} from ${
          isAllCourses ? "all courses" : selectedCourse
        }?`
      );
      if (!confirmation) return;
  
      const response = await axios.post(
        "http://localhost:5000/course/remove-student-from-course",
        {
          studentId,
          courseId: isAllCourses
            ? null
            : courses.find((course) => course.title === selectedCourse)?._id,
          removeAllCourses: isAllCourses,
        }
      );
  
      if (response.data.success) {
        alert(`${studentName} removed from ${
          isAllCourses ? "all courses" : selectedCourse
        }.`);
  
        // Update both students and filteredStudents state
        const updatedStudents = students.map((student) =>
          student._id === studentId
            ? {
                ...student,
                enrollments: isAllCourses
                  ? [] // Clear all enrollments
                  : student.enrollments.filter(
                      (enrollment) => enrollment.course.title !== selectedCourse
                    ),
              }
            : student
        );
  
        setStudents(updatedStudents);
        filterStudents(updatedStudents); // Ensure filtered list is also updated
        adjustPageAfterDeletion();
        
      } else {
        alert(`Failed to remove ${studentName} from the course(s).`);
      }
    } catch (error) {
      console.error("Error removing student from course:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const removeFromCourseMulti = async () => {
    try {
      const isAllCourses = selectedCourse === "";
  
      const studentsToRemove =
        selectedStudents.length > 0
          ? students.filter((student) => selectedStudents.includes(student._id))
          : filteredStudents;
  
      if (studentsToRemove.length === 0) {
        alert("No students available to remove.");
        return;
      }
  
      const confirmation = window.confirm(
        `Are you sure you want to remove ${studentsToRemove.length} student(s) from ${
          isAllCourses ? "all courses" : selectedCourse
        }?`
      );
      if (!confirmation) return;
  
      const studentIds = studentsToRemove.map((student) => student._id);
  
      const response = await axios.post(
        "http://localhost:5000/course/remove-students-from-course",
        {
          studentIds,
          courseId: isAllCourses
            ? null
            : courses.find((course) => course.title === selectedCourse)?._id,
          removeAllCourses: isAllCourses,
        }
      );
  
      if (response.data.success) {
        alert(
          `${studentsToRemove.length} student(s) removed from ${
            isAllCourses ? "all courses" : selectedCourse
          }.`
        );
  
        const updatedStudents = students.map((student) => ({
          ...student,
          enrollments: isAllCourses
            ? [] // Clear all enrollments
            : student.enrollments.filter(
                (enrollment) => enrollment.course.title !== selectedCourse
              ),
        }));
  
        setStudents(updatedStudents);
        filterStudents(updatedStudents); // Sync filtered list
        adjustPageAfterDeletion();
        setSelectedStudents([]); // Clear selected checkboxes
      } else {
        alert("Failed to remove students from the course(s).");
      }
    } catch (error) {
      console.error("Error removing students from course:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const removeStudentFromInstitution = async (studentId) => {
    try {

       // Confirm removal action
       if (
        !window.confirm(
          `Are you sure you want to remove this student?`
        )
      ) {
        return;
      }
      const response = await axios.post(
        "http://localhost:5000/user//update-only-institution-code",
        {
          _id: studentId,
          code: "NO-INSTITUTION", 
        }
      );
  
      if (response.data.success) {
        alert("Student removed from the institution.");
     
        setStudents((prev) => prev.filter((student) => student._id !== studentId));
      } else {
        alert("Failed to remove student.");
      }
    } catch (error) {
      console.error("Error removing student:", error);
    }
  };

  const removeSelectedStudents = async () => {
    try {
      // Determine the target students: selected or all students
      const studentsToRemove =
        selectedStudents.length > 0
          ? students.filter((student) => selectedStudents.includes(student._id))
          : students;
  
      if (studentsToRemove.length === 0) {
        alert("No students to remove.");
        return;
      }
  
      // Confirm removal action
      if (
        !window.confirm(
          `Are you sure you want to remove ${studentsToRemove.length} student(s)?`
        )
      ) {
        return;
      }
  
      // Loop through and remove each student
      for (const student of studentsToRemove) {
        await axios.post("http://localhost:5000/user//update-only-institution-code", {
          _id: student._id,
          code: "NO-INSTITUTION", // Mark as removed from institution
        });
  
       
        setStudents((prev) =>
          prev.filter((s) => s._id !== student._id)
        );
      }
  
      alert(`${studentsToRemove.length} student(s) removed successfully.`);
      setSelectedStudents([]); 
    } catch (error) {
      console.error("Error removing students:", error);
      alert("Failed to remove students.");
    }
  };

  const getAllStudents = async (code) => {
    try {
      const res = await getStudents(code);
      setStudents(res);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleMultiVisibility = async () => {
    try {
      if (!selectedCourse) {
        alert("Please select a course to toggle visibility.");
        return;
      }
  
      // Determine the target students: either selected or all filtered students
      const targetStudents = selectedStudents.length > 0 
        ? students.filter((student) => selectedStudents.includes(student._id))
        : filteredStudents;
  
      // Collect enrollments for the selected course from the target students
      const relevantEnrollments = targetStudents.flatMap((student) =>
        student.enrollments.filter(
          (enrollment) => enrollment.course.title === selectedCourse
        )
      );
  
      if (relevantEnrollments.length === 0) {
        alert("No matching enrollments found for the selected course.");
        return;
      }
  
      // Prepare batch update payload
      const updates = relevantEnrollments.map((enrollment) => ({
        enrollmentId: enrollment._id,
        visible: !enrollment.visible, // Toggle visibility
      }));
  
      // Send batch update request to the backend
      const response = await axios.post(
        "http://localhost:5000/course/update-multiple-enrollments",
        { updates }
      );
  
      if (response.data.success) {
        // Update local state to reflect changes
        setStudents((prev) =>
          prev.map((student) => ({
            ...student,
            enrollments: student.enrollments.map((enrollment) => {
              const updated = updates.find(
                (u) => u.enrollmentId === enrollment._id
              );
              return updated
                ? { ...enrollment, visible: updated.visible }
                : enrollment;
            }),
          }))
        );
        alert("Visibility updated.");
      } else {
        alert("Failed to update visibility.");
      }
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };


  const toggleVisibility = async (enrollmentId, currentVisibility) => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        enrollments: student.enrollments.map((enrollment) =>
          enrollment._id === enrollmentId
            ? { ...enrollment, visible: !currentVisibility }
            : enrollment
        ),
      }))
    );
  
    try {
      const response = await axios.post(
        `http://localhost:5000/course/update-enrollment/${enrollmentId}`,
        { visible: !currentVisibility }
      );
  
      if (!response.data.success) {
        // Revert the state if the API call fails
        alert("Failed to update visibility.");
        setStudents((prev) =>
          prev.map((student) => ({
            ...student,
            enrollments: student.enrollments.map((enrollment) =>
              enrollment._id === enrollmentId
                ? { ...enrollment, visible: currentVisibility }
                : enrollment
            ),
          }))
        );
      }
    } catch (error) {
      console.error("Error toggling visibility:", error);
      // Revert the state on error
      setStudents((prev) =>
        prev.map((student) => ({
          ...student,
          enrollments: student.enrollments.map((enrollment) =>
            enrollment._id === enrollmentId
              ? { ...enrollment, visible: currentVisibility }
              : enrollment
          ),
        }))
      );
    }
  };
  const getAllCourses = async (code) => {
    try {
      const res = await getCoursesByProp("creator.email", authUser.email, code);
      setCourses(res.res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId) // Deselect if already selected
        : [...prev, studentId] // Add to selected list if not selected
    );
  };

  const isChecked = (studentId) => selectedStudents.includes(studentId);

  const filterStudents = async () => {
    try {
      // Step 1: Initial filtering based on search and selected course
      const initiallyFiltered = await Promise.all(
        students.map(async (student) => {
          const enrollments = student.enrollments || [];
  
          console.log(`Processing Student: ${student.username}, Enrollments: `, enrollments);
  
          const matchesCourse =
            selectedCourse === "" ||
            enrollments.some((enrollment) => enrollment.course.title === selectedCourse);
  
          const matchesSearch = student.username
            .toLowerCase()
            .startsWith(searchTerm.toLowerCase());
  
          console.log(
            `Student ${student.username}: Matches Search - ${matchesSearch}, Matches Course - ${matchesCourse}`
          );
  
          // Return the student only if both search and course match
          return matchesCourse && matchesSearch ? student : null;
        })
      );
  
      // Step 2: Filter out null values from initial filtering
      const preFilteredStudents = initiallyFiltered.filter((student) => student !== null);
      console.log("Pre-filtered Students: ", preFilteredStudents);
  
      // Step 3: Refine filtering by checking actual enrollments from the backend
      const finalFiltered = await Promise.all(
        preFilteredStudents.map(async (student) => {
          const enrolledCourses = await getEnrolledCourses(student._id, "true");
          console.log(`Enrolled Courses for ${student.username}:`, enrolledCourses);
  
          const isEnrolledInSelectedCourse =
            selectedCourse === "" ||
            enrolledCourses.res.some((course) => course.title === selectedCourse);
  
          // Return the student only if enrolled in the selected course (or any course if "All Courses")
          return isEnrolledInSelectedCourse ? student : null;
        })
      );
  
      // Final step: Remove students with no enrollments for "All Courses" view
      const filteredList = finalFiltered.filter((student) => {
        if (selectedCourse === "") {
          return student.enrollments && student.enrollments.length > 0;
        }
        return student !== null;
      });

         // **Sort by Name Alphabetically (A-Z)**
    const sortedList = filteredList.sort((a, b) =>
      a.username.localeCompare(b.username)
    );
  
      setFilteredStudents(sortedList);
    } catch (error) {
      console.error("Error filtering students:", error);
    }
  };
  const downloadGradesOneFile = async () => {
    try {
      const targetStudents =
        selectedStudents.length > 0
          ? students.filter((student) => selectedStudents.includes(student._id))
          : filteredStudents;
  
      if (targetStudents.length === 0) {
        alert("No students available to download grades.");
        return;
      }
  
      let allGrades = [];
  
      // Iterate over each student
      for (const student of targetStudents) {
        const response = await axios.get(
          `http://localhost:5000/course/get-all-grades/${student._id}`
        );
        const gradesData = response.data.data;
  
        // If a course is selected, filter the grades to include only that course
        const relevantGrades = selectedCourse
          ? gradesData.filter((grade) => grade.course === selectedCourse)
          : gradesData;
  
        if (relevantGrades.length === 0) continue; // Skip if no relevant grades
  
        // Group grades by course title
        const gradesByCourse = relevantGrades.reduce((acc, grade) => {
          acc[grade.course] = acc[grade.course] || [];
          acc[grade.course].push(grade);
          return acc;
        }, {});
  
        // Process each course and append individual + cumulative grades
        Object.entries(gradesByCourse).forEach(([course, courseGrades]) => {
          // Add individual grades for the course
          courseGrades.forEach((item) => {
            allGrades.push({
              Email: student.email,
              Username: student.username,
              'First Name': student.firstName,
              'Last Name': student.lastName,
              Course: item.course,
              'Lesson Title': item.lessonTitle,
              Grade: item.grade.toFixed(2),
              'Type of Grade': 'Individual',
            });
          });
  
          // Calculate cumulative grade for the course
          const totalGrades = courseGrades.reduce((sum, item) => sum + item.grade, 0);
          const cumulativeGrade = (totalGrades / courseGrades.length).toFixed(2);
  
          // Add cumulative grade row for the course
          allGrades.push({
            Email: student.email,
            Username: student.username,
            'First Name': student.firstName,
            'Last Name': student.lastName,
            Course: course,
            'Lesson Title': '',
            Grade: cumulativeGrade,
            'Type of Grade': 'Cumulative',
          });
        });
      }
  
      if (allGrades.length === 0) {
        alert("No grades available for the selected students or courses.");
        return;
      }
  
      // Create the Excel worksheet and auto-adjust column widths
      const worksheet = XLSX.utils.json_to_sheet(allGrades);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Students Grades");
  
      const maxWidth = (data) =>
        Math.max(...data.map((item) => (item ? item.toString().length : 0))) + 3;
  
      worksheet["!cols"] = [
        { wch: maxWidth(allGrades.map((row) => row.Email)) },
        { wch: maxWidth(allGrades.map((row) => row.Username)) },
        { wch: maxWidth(allGrades.map((row) => row["First Name"])) },
        { wch: maxWidth(allGrades.map((row) => row["Last Name"])) },
        { wch: maxWidth(allGrades.map((row) => row.Course)) },
        { wch: maxWidth(allGrades.map((row) => row["Lesson Title"])) },
        { wch: maxWidth(allGrades.map((row) => row.Grade)) },
        { wch: maxWidth(allGrades.map((row) => row["Type of Grade"])) },
      ];
  
      // Generate and download the Excel file
      const filename = selectedCourse
        ? `${selectedCourse}_Grades.xlsx`
        : `All_Courses_Grades.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error("Error downloading students' grades:", error);
    }
  };

  const handleSendBulkNotification = () => {
    if (selectedStudents.length === 0) {
      alert("No students selected for bulk notification.");
      return;
    }
    navigate(`/admin/send-notification`, { state: { studentIds: selectedStudents, sender: authUser.username  } });
  };

  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Page change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const adjustPageAfterDeletion = () => {
    const lastPage = Math.ceil(filteredStudents.length / itemsPerPage);
    if (currentPage > lastPage && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
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
          <p className="font-semibold text-lg">Students List</p>
          <div className="flex items-center space-x-3">
       

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="border px-3 py-1 rounded-md text-sm"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course.title}>
                  {course.title}
                </option>
              ))}
            </select>
            <div className="flex items-center">
              <input
                placeholder="Search by name"
                className="text-sm focus:outline-none focus:border-b-stone-400 border-b-transparent border-b-[1.5px] pr-2 py-1 font-medium text-stone-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <IoMdSearch />
            </div>
          </div>
        </div>
    

        <div className="my-2 flex items-center justify-end">

          <button
            onClick={() => navigate("/admin/invite/students")}
            className="text-white font-medium px-3 py-1 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
          >
            + Invite students
          </button>

          <button
  onClick={handleSendBulkNotification}
  className="text-white font-medium px-3 py-1 ml-3 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
>
  Send Notification
</button>

<button
    onClick={() => {
      if (selectedStudents.length === 0) {
        alert("Please select at least one student to download grades.");
      } else {
        downloadGradesOneFile();
      }
    }}
    className="text-white font-medium px-3 py-1 ml-3 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
  >
    Download Grades
  </button>
     

        <button
    onClick={toggleMultiVisibility}
   className="text-white font-medium px-3 py-1 ml-3 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
  >
    Toggle Visibility 
  </button>
  <button
    onClick={() => {
      if (selectedStudents.length === 0) {
        alert("Please select at least one student to remove.");
      } else {
        removeFromCourseMulti();
      }
    }}
    className="text-white font-medium px-3 py-1 ml-3 rounded-full linearGradient_ver1 text-sm hover:scale-[1.05] transition-all"
  >
    Remove Students
  </button>
  </div>

        <div className="bg-white py-2 px-4 mt-1 rounded-lg">
          <table className="table-auto w-full">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Progress</th>
                <th className="text-end">Options</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student) => (
                <StudentCard key={student._id} student={student}  
                selectedCourse={selectedCourse}
                toggleVisibility={toggleVisibility}
                isChecked = {isChecked}
                handleCheckboxChange = {handleCheckboxChange} 
                removeStudentFromInstitution={removeStudentFromInstitution}
                removeStudentFromCourse={removeStudentFromCourse}
                authUser = {authUser}/>
               
              ))}
              
            </tbody>
            <tfoot>
      <tr>
        <td colSpan="4" >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={toggleSelectAll}
              className="w-5 h-5 mr-2"
            />
            <label className="font-normal">Select All</label>
          </div>
        </td>
      </tr>
    </tfoot>
  </table>



          <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        </div>
      </div>
    </div>
  );
};

const StudentCard = ({ student, selectedCourse, toggleVisibility, isChecked,handleCheckboxChange, removeStudentFromCourse, authUser }) => {
  // Find the enrollment matching the selected course (if any)
  const navigate = useNavigate();
  const selectedEnrollment = student.enrollments?.find(
    (enrollment) => enrollment.course?.title === selectedCourse
  );

  const calculateProgress = (enrollment) => {
    if(enrollment)
    {
    const completedLessons = enrollment.completedLessons.length;
    const totalLessons = enrollment.course.lessons.length;
    return (completedLessons / totalLessons) * 100;
    }else
    {
      return 0;
    }
  };

  // Calculate average progress for all enrollments
  const calculateAverageProgress = () => {
    if (!student.enrollments || student.enrollments.length === 0) return 0;
    const totalProgress = student.enrollments.reduce(
      (sum, enrollment) => sum + calculateProgress(enrollment),
      0
    );
    return totalProgress / student.enrollments.length;
  };

  // Determine the progress to display
  const progress = selectedCourse
    ? calculateProgress(
        student.enrollments.find(
          (enrollment) => enrollment.course.title === selectedCourse
        )
      )
    : 0; // Use average if "All Courses" is selected
  // Condition to show visibility only if a specific course is selected
  const showVisibilityIcon = selectedCourse && selectedEnrollment;

  const { _id: enrollmentId, visible } = selectedEnrollment || {};

  /*
  const progress = selectedEnrollment
  ? calculateProgress(selectedEnrollment)
  : 0; // Default to 0 if no enrollment found
 */
  const downloadGrades = async (studentId, studentName) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/course/get-all-grades/${studentId}`
      );
      const gradesData = response.data.data;
  
      if (gradesData.length === 0) {
        alert("No grades available for this student.");
        return;
      }
  
      let worksheetData = [];
  
      // Filter grades based on the selected course (if any)
      const relevantGrades = selectedCourse
        ? gradesData.filter((grade) => grade.course === selectedCourse)
        : gradesData;
  
      if (relevantGrades.length === 0) {
        alert(`No grades available for the selected course for ${studentName}.`);
        return;
      }
  
      // Group grades by course title
      const gradesByCourse = relevantGrades.reduce((acc, grade) => {
        acc[grade.course] = acc[grade.course] || [];
        acc[grade.course].push(grade);
        return acc;
      }, {});
  
      // Process each course and append individual + cumulative grades
      Object.entries(gradesByCourse).forEach(([course, courseGrades]) => {
        // Add individual grades for the course
        courseGrades.forEach((grade) => {
          worksheetData.push({
            'Course': grade.course,
            'Lesson Title': grade.lessonTitle,
            'Grade': grade.grade.toFixed(2),
            'Type of Grade': 'Individual',
          });
        });
  
        // Calculate cumulative grade for the course
        const totalGrades = courseGrades.reduce((sum, item) => sum + item.grade, 0);
        const cumulativeGrade = (totalGrades / courseGrades.length).toFixed(2);
  
        // Add cumulative grade row for the course
        worksheetData.push({
          'Course': course,
          'Lesson Title': '',
          'Grade': cumulativeGrade,
          'Type of Grade': 'Cumulative',
        });
      });
  
      // Create the worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
      // Auto-adjust column widths
      const maxWidth = (data) =>
        Math.max(...data.map((item) => (item ? item.toString().length : 0))) + 3;
  
      worksheet['!cols'] = [
        { wch: maxWidth(worksheetData.map((row) => row.Course)) },
        { wch: maxWidth(worksheetData.map((row) => row['Lesson Title'])) },
        { wch: maxWidth(worksheetData.map((row) => row.Grade)) },
        { wch: maxWidth(worksheetData.map((row) => row['Type of Grade'])) },
      ];
  
      // Create and download the Excel file
      const filename = selectedCourse
        ? `${studentName}_${selectedCourse}_Grades.xlsx`
        : `${studentName}_All_Courses_Grades.xlsx`;
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Grades');
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error downloading grades:', error);
    }
  };

  const handleSendNotification = (studentId) => {
    navigate(`/admin/send-notification`, { state: { studentIds: [studentId], sender:authUser.username } });
  };


  return (
    <tr>
    <td className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={isChecked(student._id)}
        onChange={() => handleCheckboxChange(student._id)}
        className="w-5 h-5"
      />
      <span>{student.username || "Unknown"}</span>
    </td>
    <td>{student.email || "No Email"}</td>
    <td className="w-[30%]">
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-600 w-12 text-right">
      {progress.toFixed(1)}%
    </span>
    <div className="flex-grow">
      <ProgressBar progress={progress} />
    </div>
  </div>
</td>

    <td className="flex space-x-6 items-center justify-end">
    

    {showVisibilityIcon && (
  <button
    className="p-2 hover:bg-green-200 transition-all bg-green-100 rounded-full cursor-pointer flex items-center justify-center relative focus:outline-none hover-parent"
    onClick={() => toggleVisibility(enrollmentId, visible)}
    aria-label={visible ? "Hide" : "Show"}
  >
    {visible ? (
      <FiEye className="text-green-600" />
    ) : (
      <FiEyeOff className="text-gray-600" />
    )}
    <OnHoverExtraHud name={visible ? "Visible" : "Hidden"} />
  </button>
)}
{/* Send Notification Button */}
<button
          className="p-2 rounded-full transition-all bg-yellow-100 hover:bg-yellow-200 cursor-pointer flex items-center justify-center relative focus:outline-none hover-parent"
          onClick={() => handleSendNotification(student._id)}
          aria-label="Send Notification"
        >
          <FiBell className="text-yellow-600" />
          <OnHoverExtraHud name={"Send Notification"} />
        </button>

      {/* Remove Button */}
      <button
  className="p-2 hover:bg-blue-200 transition-all bg-blue-100 rounded-full cursor-pointer flex items-center justify-center relative focus:outline-none hover-parent"
  onClick={() => removeStudentFromCourse(student._id, student.username)}
  aria-label="Delete"
>
  <RiDeleteBin7Fill className="text-md text-blue-700" />
  <OnHoverExtraHud name={"Remove"} />
</button>
      {/* Edit Button 
      <div className="p-2 hover:bg-red-200 transition-all bg-red-100 rounded-full cursor-pointer hover-parent">
        <RiEdit2Fill className="text-md text-red-600" />
        <OnHoverExtraHud name={"Edit"} />
      </div>
  */}
      {/* Download Grades Button */}
      <button
  className="p-2 rounded-full transition-all bg-green-100 hover:bg-green-200 cursor-pointer flex items-center justify-center relative focus:outline-none hover-parent"
  onClick={() => downloadGrades(student._id, student.username)}
  aria-label="Download Grades"
>
  <FiDownload className="text-md text-green-600" />
  <OnHoverExtraHud name={"Download Grades"} />
</button>
    </td>
  </tr>
  );
};

export default AdminManageStudents;

