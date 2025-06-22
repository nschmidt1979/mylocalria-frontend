import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();

// Cloud function to send emails (needs to be deployed to Firebase)
const sendEmailNotification = httpsCallable(functions, 'sendEmailNotification');

export const notificationService = {
  // Send notification for new review
  async notifyNewReview(review, advisor) {
    try {
      // Get advisor's email
      const advisorDoc = await getDocs(query(collection(db, 'users'), where('crdNumber', '==', advisor.crdNumber)));
      if (!advisorDoc.empty) {
        const advisorData = advisorDoc.docs[0].data();
        
        // Create notification record
        await addDoc(collection(db, 'notifications'), {
          type: 'new_review',
          recipientId: advisorData.uid,
          reviewId: review.id,
          advisorId: advisor.crdNumber,
          createdAt: new Date(),
          read: false,
          data: {
            reviewerName: review.reviewerName,
            rating: review.rating,
            title: review.title,
          },
        });

        // Send email if notifications are enabled
        if (advisorData.notifications?.emailNotifications) {
          await sendEmailNotification({
            to: advisorData.email,
            subject: `New Review: ${review.title}`,
            template: 'new_review',
            data: {
              advisorName: advisor.name,
              reviewerName: review.reviewerName,
              rating: review.rating,
              title: review.title,
              reviewUrl: `/advisor/${advisor.crdNumber}#review-${review.id}`,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error sending review notification:', error);
      throw error;
    }
  },

  // Send notification for review update
  async notifyReviewUpdate(review, advisor) {
    try {
      // Get advisor's email
      const advisorDoc = await getDocs(query(collection(db, 'users'), where('crdNumber', '==', advisor.crdNumber)));
      if (!advisorDoc.empty) {
        const advisorData = advisorDoc.docs[0].data();
        
        // Create notification record
        await addDoc(collection(db, 'notifications'), {
          type: 'review_update',
          recipientId: advisorData.uid,
          reviewId: review.id,
          advisorId: advisor.crdNumber,
          createdAt: new Date(),
          read: false,
          data: {
            reviewerName: review.reviewerName,
            rating: review.rating,
            title: review.title,
          },
        });

        // Send email if notifications are enabled
        if (advisorData.notifications?.reviewUpdates) {
          await sendEmailNotification({
            to: advisorData.email,
            subject: `Review Updated: ${review.title}`,
            template: 'review_update',
            data: {
              advisorName: advisor.name,
              reviewerName: review.reviewerName,
              rating: review.rating,
              title: review.title,
              reviewUrl: `/advisor/${advisor.crdNumber}#review-${review.id}`,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error sending review update notification:', error);
      throw error;
    }
  },

  // Send notification for new advisor in area
  async notifyNewAdvisor(advisor, usersInArea) {
    try {
      // Get users who have opted in for new advisor notifications
      const usersQuery = query(
        collection(db, 'users'),
        where('notifications.newAdvisors', '==', true),
        where('location.zipCode', 'in', usersInArea)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      
      // Create notifications and send emails
      const notifications = usersSnapshot.docs.map(async (userDoc) => {
        const userData = userDoc.data();
        
        // Create notification record
        await addDoc(collection(db, 'notifications'), {
          type: 'new_advisor',
          recipientId: userData.uid,
          advisorId: advisor.crdNumber,
          createdAt: new Date(),
          read: false,
          data: {
            advisorName: advisor.name,
            location: advisor.location,
          },
        });

        // Send email if notifications are enabled
        if (userData.notifications?.emailNotifications) {
          await sendEmailNotification({
            to: userData.email,
            subject: `New Financial Advisor in Your Area: ${advisor.name}`,
            template: 'new_advisor',
            data: {
              userName: userData.firstName,
              advisorName: advisor.name,
              location: advisor.location,
              advisorUrl: `/advisor/${advisor.crdNumber}`,
            },
          });
        }
      });

      await Promise.all(notifications);
    } catch (error) {
      console.error('Error sending new advisor notifications:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: new Date(),
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Get user's unread notifications
  async getUnreadNotifications(userId) {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipientId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(notificationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },
}; 