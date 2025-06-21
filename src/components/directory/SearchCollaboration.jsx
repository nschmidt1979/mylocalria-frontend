import { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  ShareIcon,
  ChatBubbleLeftRightIcon,
  UserPlusIcon,
  UserMinusIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const SearchCollaboration = ({ currentUser, advisors, filters, onApplyFilters }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadCollaborators();
      loadInvitations();
    }
  }, [currentUser]);

  const loadCollaborators = async () => {
    try {
      // In a real implementation, this would fetch from your backend
      const mockCollaborators = [
        {
          id: '1',
          email: 'collaborator1@example.com',
          name: 'John Doe',
          role: 'owner',
          lastActive: new Date().toISOString(),
        },
        {
          id: '2',
          email: 'collaborator2@example.com',
          name: 'Jane Smith',
          role: 'editor',
          lastActive: new Date().toISOString(),
        },
      ];
      setCollaborators(mockCollaborators);
    } catch (err) {
      setError('Failed to load collaborators');
      console.error('Error loading collaborators:', err);
    }
  };

  const loadInvitations = async () => {
    try {
      // In a real implementation, this would fetch from your backend
      const mockInvitations = [
        {
          id: '1',
          email: 'invite1@example.com',
          status: 'pending',
          sentAt: new Date().toISOString(),
        },
      ];
      setInvitations(mockInvitations);
    } catch (err) {
      setError('Failed to load invitations');
      console.error('Error loading invitations:', err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In a real implementation, this would send to your backend
      const newInvitation = {
        id: Date.now().toString(),
        email: inviteEmail,
        message: inviteMessage,
        status: 'pending',
        sentAt: new Date().toISOString(),
      };

      setInvitations(prev => [...prev, newInvitation]);
      setSuccess('Invitation sent successfully');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteMessage('');
    } catch (err) {
      setError('Failed to send invitation');
      console.error('Error sending invitation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorId) => {
    try {
      // In a real implementation, this would call your backend
      setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
      setSuccess('Collaborator removed successfully');
    } catch (err) {
      setError('Failed to remove collaborator');
      console.error('Error removing collaborator:', err);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      // In a real implementation, this would call your backend
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      const newCollaborator = {
        id: Date.now().toString(),
        email: invitations.find(i => i.id === invitationId).email,
        role: 'editor',
        lastActive: new Date().toISOString(),
      };
      setCollaborators(prev => [...prev, newCollaborator]);
      setSuccess('Invitation accepted successfully');
    } catch (err) {
      setError('Failed to accept invitation');
      console.error('Error accepting invitation:', err);
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      // In a real implementation, this would call your backend
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      setSuccess('Invitation rejected successfully');
    } catch (err) {
      setError('Failed to reject invitation');
      console.error('Error rejecting invitation:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      const message = {
        id: Date.now().toString(),
        sender: currentUser.email,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      setChatMessages(prev => ({
        ...prev,
        [activeChat]: [...(prev[activeChat] || []), message],
      }));

      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const renderCollaboratorList = () => (
    <div className="space-y-4">
      {collaborators.map(collaborator => (
        <div
          key={collaborator.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{collaborator.name}</p>
              <p className="text-sm text-gray-500">{collaborator.email}</p>
              <p className="text-xs text-gray-400">
                Last active: {new Date(collaborator.lastActive).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveChat(collaborator.id)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
              Chat
            </button>
            {collaborator.role !== 'owner' && (
              <button
                onClick={() => handleRemoveCollaborator(collaborator.id)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <UserMinusIcon className="h-4 w-4 mr-2" />
                Remove
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderInvitationList = () => (
    <div className="space-y-4">
      {invitations.map(invitation => (
        <div
          key={invitation.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
        >
          <div>
            <p className="text-sm font-medium text-gray-900">{invitation.email}</p>
            <p className="text-xs text-gray-500">
              Sent: {new Date(invitation.sentAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleAcceptInvitation(invitation.id)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Accept
            </button>
            <button
              onClick={() => handleRejectInvitation(invitation.id)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderChat = () => {
    if (!activeChat) return null;

    const collaborator = collaborators.find(c => c.id === activeChat);
    const messages = chatMessages[activeChat] || [];

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Chat with {collaborator?.name}
              </h3>
              <button
                onClick={() => setActiveChat(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-4 h-96 overflow-y-auto space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === currentUser.email ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === currentUser.email
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <UserGroupIcon className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">Collaboration</h2>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Invite Collaborator
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collaborators */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Collaborators</h3>
        {renderCollaboratorList()}
      </div>

      {/* Invitations */}
      {invitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Pending Invitations</h3>
          {renderInvitationList()}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Invite Collaborator</h3>
            </div>

            <form onSubmit={handleInvite} className="p-4 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {renderChat()}
    </div>
  );
};

export default SearchCollaboration; 