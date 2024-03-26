import LearnersProfileTemplate from '../../../Pages/Learners-Profile-Template/Learners-Profile-Template.js';
import CourseInProgress from '../../Components/Course-in-progress/Course-in-progress.js';
import PersonalProfile from '../../../components/Personal-Profile-Components/PersonalProfile.js';
import './CourseProgressPage.css';

/* Page is built, should look better once resizeable components are uploaded to github */

function CourseProgressPage() {
  return (
    <div className='myContainer'>
      <div className='PersonalProfileContainer'>
        <PersonalProfile />
      </div>
      <CourseInProgress />
    </div>
  );
}

export default function CourseProgessPage2() {
  return <LearnersProfileTemplate childComponent={CourseProgressPage} />;
}
