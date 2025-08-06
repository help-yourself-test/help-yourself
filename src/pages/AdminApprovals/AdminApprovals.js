import React, { useState, useEffect } from "react";
import apiService from "../../services/api";
import "./AdminApprovals.css";

const AdminApprovals = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.api.get("/auth/admin/pending-requests");
      setPendingRequests(response.data.requests || []);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setError("Failed to fetch pending admin requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, action) => {
    try {
      setProcessingId(userId);
      await apiService.api.put(`/auth/admin/approve-request/${userId}`, {
        action: action,
      });

      // Remove the request from the list
      setPendingRequests((prev) =>
        prev.filter((request) => request._id !== userId)
      );

      alert(`Admin request ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      setError(`Failed to ${action} admin request`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-approvals">
        <div className="loading">Loading pending requests...</div>
      </div>
    );
  }

  return (
    <div className="admin-approvals">
      <div className="approvals-header">
        <h1>Admin Approval Requests</h1>
        <p>Review and approve pending admin access requests</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {pendingRequests.length === 0 ? (
        <div className="no-requests">
          <h3>No pending admin requests</h3>
          <p>All admin requests have been processed.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {pendingRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-info">
                <h3>
                  {request.firstName} {request.lastName}
                </h3>
                <p className="email">{request.email}</p>
                <p className="phone">
                  {request.phoneNumber || "No phone provided"}
                </p>
                <p className="country">
                  {request.country || "No country provided"}
                </p>
                <p className="created">
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </p>
                <div className="status-badge">
                  <span className="pending">Pending Approval</span>
                </div>
              </div>

              <div className="request-actions">
                <button
                  className="approve-btn"
                  onClick={() => handleApproval(request._id, "approve")}
                  disabled={processingId === request._id}
                >
                  {processingId === request._id ? "Processing..." : "Approve"}
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleApproval(request._id, "reject")}
                  disabled={processingId === request._id}
                >
                  {processingId === request._id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="refresh-section">
        <button
          className="refresh-btn"
          onClick={fetchPendingRequests}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Requests"}
        </button>
      </div>
    </div>
  );
};

export default AdminApprovals;
