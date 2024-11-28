import React, { useEffect, useState } from "react";
import axios from 'axios';
import GeneralNavbar from "../../../../components/navbar/GeneralNavbar";
import LearningPageSideMenu from "./LearningPageSideMenu";
import LearningMainContent from "./LearningMainContent";
import getEnrollmentData from "../../../../BackendProxy/courseProxy/getEnrollmentData"; // API to get enrollment data
import completeLesson from "../../../../BackendProxy/courseProxy/completeLesson"; // API to complete a lesson
import BarLoader from "../../../../components/loaders/BarLoader";
import { useNavigate, useSearchParams } from "react-router-dom";
import generateCertificate from "../../../../BackendProxy/courseProxy/generateCertificate";
import { jsPDF } from 'jspdf';
import { useSelector } from "react-redux";
import { v4 as uuidv4 } from 'uuid';


const LearningCoursePage = ({ userId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("id"); // Get the course ID from query parameters

  const [enrollmentData, setEnrollmentData] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLastLesson, setIsLastLesson] = useState(false); // Track if it's the last lesson
  const [isMenuOpen, setIsMenuOpen] = useState(true); // State for menu visibility
  const [loaded, setLoaded] = useState(false);
  const [userName, setUserName] = useState("");
  const [courseName, setCourseName] = useState("");
  const authUser = useSelector((state) => state.user);


  useEffect(() => {
    if (userId && courseId) {
      fetchEnrollmentData(userId, courseId);
    } else {
      console.error("Missing userId or courseId");
      setLoaded(true);
    }
  }, [userId, courseId]);

  const fetchEnrollmentData = async (userId, courseId) => {
    try {
      const { enrollment, course } = await getEnrollmentData(userId, courseId);
      console.log(enrollment)
      if (!enrollment || !course) {
        console.error("Enrollment or course data is missing or invalid");
        setLoaded(true);
        return;
      }
      const updatedLessons = course.lessons.map((lesson) => ({
        ...lesson,
        isCompleted: enrollment.completedLessons.includes(lesson._id.toString()),
      }));

      setEnrollmentData({
        ...enrollment,
        course: { ...course, lessons: updatedLessons },
      });
    
      setCourseName(course.title);

      // Set first lesson
      if (updatedLessons.length > 0) {
        setSelectedLesson(updatedLessons[0]);
        setCurrentLessonIndex(0);
      }

      setLoaded(true);
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
    }
  };

  // Check if lesson content is available for the selected lesson
  const isValidLessonContent = (lesson) => {
    return lesson && lesson.lessonContent && Object.keys(lesson.lessonContent).length > 0;
  };

  useEffect(() => {
    if (enrollmentData && selectedLesson) {
      const allLessonsCompleted = enrollmentData.course.lessons.every(
        (lesson) => lesson.isCompleted
      );

      if (allLessonsCompleted) {
        setIsLastLesson(true);
      } else if (enrollmentData.course.lessons.length === 1) {
        setIsLastLesson(!selectedLesson.isCompleted);
      } else {
        const otherLessonsCompleted = enrollmentData.course.lessons
          .filter((lesson) => lesson._id !== selectedLesson._id)
          .every((lesson) => lesson.isCompleted);

        setIsLastLesson(otherLessonsCompleted && !selectedLesson.isCompleted);
      }
    }
  }, [enrollmentData, selectedLesson]);

  const markLessonAsCompleted = async (enrollmentId, courseId, lessonId) => {
    try {
      await completeLesson(enrollmentId, courseId, lessonId);
      console.log(`Lesson ${lessonId} marked as completed.`);
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
      throw error;
    }
  };
  const generateCertificate = async (userName, courseName) => {
    // Generate a unique certificate ID
    const certificateId = uuidv4();
  
    // Generate the certificate PDF
    const doc = new jsPDF("landscape"); // Set orientation to landscape

    // Set up colors for background elements
    const primaryColor = [70, 130, 180]; // Steel blue for title and main text
    const lightColor = [220, 230, 240]; // Light blue for background design

    
    // Background rectangle
    doc.setFillColor(...lightColor);
    doc.rect(10, 10, 270, 180, "F"); // Light background rectangle to frame content

    // Decorative circle on the left
    doc.setFillColor(...primaryColor);
    doc.circle(30, 30, 20, "F"); // Filled circle for a modern look

    // Title text
    doc.setFontSize(30);
    doc.setFont("times", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Certificate of Completion", 148, 50, { align: "center" });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(60, 60, 60); // Dark gray
    doc.text("This certifies that", 148, 70, { align: "center" });

    // User's name in large font
    doc.setFontSize(24);
    doc.setFont("times", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(userName, 148, 90, { align: "center" });

    // Course completion text
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(60, 60, 60);
    doc.text(`has successfully completed the course:`, 148, 110, { align: "center" });

    // Course name in bold
    doc.setFontSize(18);
    doc.setFont("times", "bold");
    doc.setTextColor(...primaryColor);
    doc.text(courseName, 148, 130, { align: "center" });

    // Date and organization text
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const completionDate = new Date().toLocaleDateString();
    doc.text(`Date: ${completionDate}`, 30, 160); // Date at the bottom left
    doc.text("Certified by: PHC Institute", 250, 160, { align: "right" });

    doc.text(`Certificate of Completion`, 148, 60, { align: "center" });
    doc.setFontSize(16);
    
  
  const baseUrl = "http://localhost:3000";
  const authenticityLink = `${baseUrl}/certificate/verify/${certificateId}`;


  doc.setFontSize(12);
  doc.setTextColor(0, 0, 255); // Blue color for link
  doc.textWithLink(authenticityLink, 148, 170, { url: authenticityLink });

  doc.save(`Certificate_${userName}_${courseName}.pdf`);;
      
    // Save the certificate details to the backend
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + 'certificate/save', {
        username: userName,
        courseName,
        certificateId,
      });
  
      if (response.data.success) {
        console.log('Certificate saved successfully:', response.data.certificate);
      } else {
        console.error('Failed to save certificate:', response.data.message);
      }
    } catch (error) {
      console.error('Error saving certificate:', error);
    }
  };

  

  const handleNextLesson = async () => {
    try {
      console.log("handleNextLesson is called. ")
      await markLessonAsCompleted(enrollmentData._id, courseId, selectedLesson._id);
      
      const updatedLessons = enrollmentData.course.lessons.map((lesson) => {
        if (lesson._id === selectedLesson._id) {
          return { ...lesson, isCompleted: true };
        }
        return lesson;
      });

      setEnrollmentData((prevState) => ({
        ...prevState,
        course: { ...prevState.course, lessons: updatedLessons },
      }));

      const allLessonsCompleted = updatedLessons.every((lesson) => lesson.isCompleted);
      console.log("the value of allLessonsCompleted is"+ allLessonsCompleted)
      console.log("userid and course id are"+ userId + "and"+ courseId)
      if (allLessonsCompleted) {
        //const certificateUrl = await generateCertificate(userId, courseId);
        //navigate("/course-complete", { state: { certificateUrl } });
        navigate("/course-complete");
        generateCertificate(authUser.username, courseName)


      } else {
        let nextLessonIndex = currentLessonIndex + 1;
        while (nextLessonIndex < updatedLessons.length && updatedLessons[nextLessonIndex].isCompleted) {
          nextLessonIndex++;
        }

        if (nextLessonIndex < updatedLessons.length) {
          const nextLesson = updatedLessons[nextLessonIndex];
          setCurrentLessonIndex(nextLessonIndex);
          setSelectedLesson(nextLesson);
        } else {
          const firstIncompleteLesson = updatedLessons.find((lesson) => !lesson.isCompleted);
          const firstIncompleteLessonIndex = updatedLessons.indexOf(firstIncompleteLesson);
          setCurrentLessonIndex(firstIncompleteLessonIndex);
          setSelectedLesson(firstIncompleteLesson);
        }
      }
    } catch (error) {
      console.error("Failed to complete lesson and proceed:", error);
    }
  };

  return (
    <div className="w-full h-full">
      <>
        {loaded ? (
          <div className="h-full flex w-full justify-between">
            {selectedLesson ? (
              <>
                <LearningPageSideMenu
                  courseLessons={enrollmentData.course.lessons}
                  selectedLesson={selectedLesson}
                  setSelectedLesson={(lesson) => {
                    const index = enrollmentData.course.lessons.indexOf(lesson);
                    setCurrentLessonIndex(index);
                    setSelectedLesson(lesson);
                  }}
                  somethingMenu={isMenuOpen}
                  setIsMenuOpen={setIsMenuOpen}
                />
                {/* Perform lesson content validation here */}
                {isValidLessonContent(selectedLesson) ? (
                  <LearningMainContent
                    courseData={enrollmentData.course}
                    selectedLesson={selectedLesson}
                    onNextLesson={handleNextLesson}
                    isLastLesson={isLastLesson}
                    isMenuOpen={isMenuOpen}
                    enrollment={enrollmentData}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-red-500 font-semibold">Error: No content available for this lesson.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <p>The content for this lesson hasn't been added yet.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <BarLoader />
          </div>
        )}
      </>
    </div>
  );
};

export default LearningCoursePage;
