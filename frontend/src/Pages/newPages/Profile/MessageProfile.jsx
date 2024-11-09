import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GeneralNavbar from "../../../components/navbar/GeneralNavbar";

const MessageProfile = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const notificationData = location.state?.notificationData;

    const handleBackClick = () => {
        navigate('/user/notifications');
    };

    return (
        <>
            <GeneralNavbar />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '80vh',
                paddingLeft: '2rem',
                paddingTop: '2rem'
            }}>
                {notificationData ? (
                    <div style={{
                        border: '2px solid black',
                        padding: '3rem',
                        borderRadius: '8px',
                        maxWidth: '800px',
                        width: '100%',
                        wordWrap: 'break-word',
                        overflow: 'hidden'
                    }}>
                        <h2 style={{
                            fontSize: '2rem',
                            marginBottom: '1.5rem',
                            wordWrap: 'break-word'
                        }}>
                            {notificationData.payload.title}
                        </h2>
                        <p style={{
                            fontSize: '1.2rem',
                            marginBottom: '1rem'
                        }}>
                            <strong>From:</strong> {notificationData.senderName}
                        </p>
                        <p style={{
                            fontSize: '1.2rem',
                            lineHeight: '1.6',
                            wordWrap: 'break-word'
                        }}>
                            <strong>Message:</strong> {notificationData.payload.message}
                        </p>
                    </div>
                ) : (
                    <p style={{
                        border: '2px solid black',
                        padding: '3rem',
                        borderRadius: '8px',
                        fontSize: '1.2rem',
                        wordWrap: 'break-word',
                        maxWidth: '800px',
                        width: '100%'
                    }}>
                        No message data available
                    </p>
                )}
                
                <button 
                    onClick={handleBackClick}
                    style={{
                        marginTop: '2rem',
                        padding: '0.8rem 1.5rem',
                        fontSize: '1.1rem',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Back to Notifications
                </button>
            </div>
        </>
    );
};

export default MessageProfile;
