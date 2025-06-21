# React Components Documentation

This document provides comprehensive documentation for all React components in the MyLocalRIA React application.

## Table of Contents

- [Authentication Components](#authentication-components)
- [Common Components](#common-components)
- [Layout Components](#layout-components)
- [Advisor Components](#advisor-components)
- [Review Components](#review-components)
- [Notification Components](#notification-components)
- [Search Components](#search-components)
- [Directory Components](#directory-components)

---

## Authentication Components

### AdminRoute

**File:** `/src/components/auth/AdminRoute.jsx`

**Description:** Route wrapper that restricts access to admin users only.

**Props:**
- `children` (React.ReactNode, required): The components to render if user is admin

**State:** None (uses hooks)

**Hooks Used:**
- `useAuth()`: Gets current user and loading state

**Side Effects:**
- Redirects to home page if user is not admin
- Shows loading spinner while authentication is being checked

**Example Usage:**
```jsx
<AdminRoute>
  <AdminDashboard />
</AdminRoute>
```

---

### PrivateRoute

**File:** `/src/components/auth/PrivateRoute.jsx`

**Description:** Route wrapper that requires user authentication.

**Props:** None (uses React Router's `Outlet`)

**State:** None (uses hooks)

**Hooks Used:**
- `useAuth()`: Gets current user state

**Side Effects:**
- Redirects to login page if user is not authenticated
- Renders child routes if user is authenticated

**Example Usage:**
```jsx
<Routes>
  <Route element={<PrivateRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
</Routes>
```

---

### ProtectedRoute

**File:** `/src/components/auth/ProtectedRoute.jsx`

**Description:** Route wrapper that protects pages from unauthenticated access with location state.

**Props:**
- `children` (React.ReactNode, required): The components to render if user is authenticated

**State:** None (uses hooks)

**Hooks Used:**
- `useAuth()`: Gets user and loading state
- `useLocation()`: Gets current location for redirect after login

**Side Effects:**
- Shows loading spinner while authentication is being checked
- Redirects to login with location state if user is not authenticated

**Example Usage:**
```jsx
<ProtectedRoute>
  <UserProfile />
</ProtectedRoute>
```

---

## Common Components

### LoadingSpinner

**File:** `/src/components/common/LoadingSpinner.jsx`

**Description:** Reusable animated loading spinner component.

**Props:**
- `className` (string, optional, default: 'h-6 w-6'): CSS classes for styling the spinner

**State:** None

**Side Effects:** None

**Example Usage:**
```jsx
<LoadingSpinner className="h-8 w-8" />
```

---

### RouteTransition

**File:** `/src/components/common/RouteTransition.jsx`

**Description:** Provides smooth transitions between route changes.

**Props:**
- `children` (React.ReactNode, required): The components to render with transition

**State:**
- `isLoading` (boolean): Controls loading state during route transitions

**Hooks Used:**
- `useState()`: Manages loading state
- `useEffect()`: Watches for location changes and handles timing
- `useLocation()`: Detects route changes

**Side Effects:**
- Shows loading overlay for 300ms minimum on route changes
- Clears timeout on cleanup

**Example Usage:**
```jsx
<RouteTransition>
  <AppContent />
</RouteTransition>
```

---

### SocialIcons

**File:** `/src/components/common/SocialIcons.jsx`

**Description:** Collection of social media icon components.

**Components:**
- `FacebookIcon`
- `TwitterIcon` 
- `LinkedInIcon`

**Props (for each icon):**
- `className` (string, optional, default: 'h-6 w-6'): CSS classes for styling

**State:** None

**Side Effects:** None

**Example Usage:**
```jsx
<FacebookIcon className="h-8 w-8 text-blue-600" />
<TwitterIcon className="h-8 w-8 text-blue-400" />
<LinkedInIcon className="h-8 w-8 text-blue-700" />
```

---

### StarRating

**File:** `/src/components/common/StarRating.jsx`

**Description:** Displays star ratings with customizable size and rating.

**Props:**
- `rating` (number, optional, default: 0): The rating value
- `outOf` (number, optional, default: 5): Total number of stars
- `className` (string, optional, default: ''): Additional CSS classes
- `size` (number, optional, default: 8): Size of the stars

**State:** None

**Side Effects:** None

**Example Usage:**
```jsx
<StarRating rating={4.5} outOf={5} size={10} className="mb-2" />
```

---

## Layout Components

### Layout

**File:** `/src/components/layout/Layout.jsx`

**Description:** Main layout wrapper with header and footer.

**Props:**
- `children` (React.ReactNode, required): The main content to render

**State:** None

**Side Effects:** None

**Example Usage:**
```jsx
<Layout>
  <PageContent />
</Layout>
```

---

### Header

**File:** `/src/components/layout/Header.jsx`

**Description:** Main navigation header with authentication and mobile menu.

**Props:** None

**State:**
- `isMobileMenuOpen` (boolean): Controls mobile menu visibility
- `showNotifications` (boolean): Controls notification panel visibility

**Hooks Used:**
- `useAuth()`: Gets user state and logout function
- `useNavigate()`: For programmatic navigation
- `useState()`: Manages component state

**Side Effects:**
- Handles user logout
- Dynamic navigation based on user role (admin, advisor)
- Mobile menu toggle functionality

**Example Usage:**
```jsx
<Header />
```

---

### Footer

**File:** `/src/components/layout/Footer.jsx`

**Description:** Site footer with links and company information.

**Props:** None

**State:** None

**Side Effects:** None

**Example Usage:**
```jsx
<Footer />
```

---

## Advisor Components

### AdvisorCard

**File:** `/src/components/advisors/AdvisorCard.jsx`

**Description:** Displays advisor information in a card format.

**Props:**
- `advisor` (object, required): Advisor data object with properties like:
  - `primary_business_name` (string)
  - `crd_number` (string)
  - `principal_office_address_1` (string)
  - `principal_office_city` (string)
  - `principal_office_state` (string)
  - `website_address` (string)
  - And other advisor-specific fields

**State:** None

**Side Effects:** None

**Example Usage:**
```jsx
<AdvisorCard advisor={advisorData} />
```

---

## Review Components

### ReviewCard

**File:** `/src/components/reviews/ReviewCard.jsx`

**Description:** Displays individual review information in a card format.

**Props:**
- `review` (object, required): Review data object with properties:
  - `reviewer_name` (string, required)
  - `reviewer_photo` (string, optional)
  - `rating` (number, required)
  - `content` (string, required)
  - `created_at` (string, required)
  - `advisor_name` (string, optional)
  - `advisor_crd` (string, optional)
  - `advisor_logo` (string, optional)
- `showAdvisorInfo` (boolean, optional, default: false): Whether to show advisor information

**State:** None

**Side Effects:** None

**Example Usage:**
```jsx
<ReviewCard review={reviewData} showAdvisorInfo={true} />
```

---

### ReviewList

**File:** `/src/components/reviews/ReviewList.jsx`

**Description:** Displays a paginated list of reviews with expansion functionality.

**Props:**
- `reviews` (array, required): Array of review objects
- `initialPageSize` (number, optional, default: 5): Number of reviews to show initially

**State:**
- `pageSize` (number): Current number of reviews to display
- `expandedReviews` (Set): Set of review IDs that are expanded

**Hooks Used:**
- `useState()`: Manages pagination and expansion state

**Side Effects:** None

**Example Usage:**
```jsx
<ReviewList reviews={reviewsArray} initialPageSize={10} />
```

---

### WriteReviewModal

**File:** `/src/components/reviews/WriteReviewModal.jsx`

**Description:** Modal for writing and submitting reviews.

**Props:**
- `advisorId` (string, required): ID of the advisor being reviewed
- `advisorName` (string, required): Name of the advisor
- `onClose` (function, required): Callback when modal is closed
- `onReviewSubmitted` (function, required): Callback when review is submitted

**State:**
- `rating` (number): Selected rating
- `hoveredRating` (number): Rating being hovered over
- `content` (string): Review content
- `loading` (boolean): Submission state
- `error` (string): Error message

**Hooks Used:**
- `useAuth()`: Gets current user information
- `useState()`: Manages form state

**Side Effects:**
- Submits review to Firestore
- Creates review document with timestamp

**Example Usage:**
```jsx
<WriteReviewModal
  advisorId="123"
  advisorName="John Doe"
  onClose={() => setShowModal(false)}
  onReviewSubmitted={handleReviewSubmitted}
/>
```

---

### ReviewManagement

**File:** `/src/components/reviews/ReviewManagement.jsx`

**Description:** Allows users to manage their own reviews (edit/delete).

**Props:** None

**State:**
- `reviews` (array): User's reviews
- `loading` (boolean): Loading state
- `error` (string): Error message
- `deleteConfirmId` (string): ID of review being deleted
- `editReview` (object): Review being edited

**Hooks Used:**
- `useAuth()`: Gets current user
- `useNavigate()`: For navigation
- `useState()`: Manages component state
- `useEffect()`: Fetches user reviews on mount

**Side Effects:**
- Fetches user reviews from Firestore
- Updates and deletes reviews in Firestore

**Example Usage:**
```jsx
<ReviewManagement />
```

---

## Notification Components

### NotificationCenter

**File:** `/src/components/notifications/NotificationCenter.jsx`

**Description:** Displays user notifications with real-time updates.

**Props:** None

**State:**
- `notifications` (array): List of notifications
- `isOpen` (boolean): Whether notification panel is open
- `loading` (boolean): Loading state
- `error` (string): Error message

**Hooks Used:**
- `useAuth()`: Gets current user
- `useState()`: Manages component state
- `useEffect()`: Fetches notifications when opened

**Side Effects:**
- Fetches unread notifications from notification service
- Marks notifications as read
- Real-time notification updates

**Example Usage:**
```jsx
<NotificationCenter />
```

---

## Search Components

### SearchFilters (Search Directory)

**File:** `/src/components/search/SearchFilters.jsx`

**Description:** Basic search filters component for advisor search.

**Props:**
- `onFilterChange` (function, required): Callback when filters change
- `initialFilters` (object, optional): Initial filter values with properties:
  - `location` (string)
  - `minRating` (number)
  - `accountMinimum` (string)
  - `services` (array)

**State:**
- `filters` (object): Current filter values

**Hooks Used:**
- `useState()`: Manages filter state

**Side Effects:**
- Calls `onFilterChange` when filters are updated

**Example Usage:**
```jsx
<SearchFilters
  onFilterChange={handleFilterChange}
  initialFilters={{ location: "Seattle", minRating: 4 }}
/>
```

---

## Directory Components

### FeaturedAdvisors

**File:** `/src/components/directory/FeaturedAdvisors.jsx`

**Description:** Displays featured advisors in a carousel format.

**Props:**
- `onAdvisorClick` (function, required): Callback when advisor is clicked
- `onCompare` (function, required): Callback when adding to comparison
- `comparisonAdvisors` (array, required): List of advisors currently in comparison

**State:**
- `featuredAdvisors` (array): List of featured advisors
- `loading` (boolean): Loading state
- `error` (string): Error message
- `currentPage` (number): Current page in carousel

**Hooks Used:**
- `useState()`: Manages component state
- `useEffect()`: Fetches featured advisors on mount

**Side Effects:**
- Queries Firestore for highly-rated, verified advisors
- Implements pagination for advisor display

**Example Usage:**
```jsx
<FeaturedAdvisors
  onAdvisorClick={handleAdvisorClick}
  onCompare={handleAddToComparison}
  comparisonAdvisors={comparisonList}
/>
```

---

### AdvisorQuickView

**File:** `/src/components/directory/AdvisorQuickView.jsx`

**Description:** Modal with detailed advisor information and tabbed interface.

**Props:**
- `isOpen` (boolean, required): Whether modal is open
- `onClose` (function, required): Callback to close modal
- `advisor` (object, required): Advisor data object
- `onCompare` (function, required): Callback for comparison functionality
- `isInComparison` (boolean, required): Whether advisor is in comparison

**State:**
- `activeTab` (string): Currently active tab
- `showReviewModal` (boolean): Whether review modal is shown

**Hooks Used:**
- `useAuth()`: Gets current user for review functionality
- `useState()`: Manages tab state and modal visibility

**Side Effects:**
- Displays advisor information in tabbed interface
- Integrates with review system

**Example Usage:**
```jsx
<AdvisorQuickView
  isOpen={showQuickView}
  onClose={() => setShowQuickView(false)}
  advisor={selectedAdvisor}
  onCompare={handleCompare}
  isInComparison={isInComparison}
/>
```

---

### SearchFilters (Directory)

**File:** `/src/components/directory/SearchFilters.jsx`

**Description:** Advanced search filters with location services and URL state management.

**Props:**
- `onSearch` (function, required): Callback when search is performed

**State:**
- `isFiltersOpen` (boolean): Whether filters panel is open
- `locationInput` (string): Location input value
- `isGettingLocation` (boolean): Whether getting user location
- `locationError` (string): Location error message
- `filters` (object): All filter values

**Hooks Used:**
- `useNavigate()`: For navigation with search params
- `useSearchParams()`: For URL state management
- `useState()`: Manages filter state

**Side Effects:**
- Gets user's current location using geolocation service
- Updates URL with search parameters
- Integrates with reverse geocoding API

**Example Usage:**
```jsx
<SearchFilters onSearch={handleSearch} />
```

---

### MessageAdvisorModal

**File:** `/src/components/directory/MessageAdvisorModal.jsx`

**Description:** Modal for sending messages to advisors.

**Props:**
- `advisorId` (string, required): ID of the advisor
- `advisorName` (string, required): Name of the advisor
- `onClose` (function, required): Callback to close modal
- `onMessageSent` (function, optional): Callback when message is sent

**State:**
- `message` (string): Message content
- `loading` (boolean): Submission state
- `error` (string): Error message
- `success` (boolean): Success state

**Hooks Used:**
- `useState()`: Manages form state

**Side Effects:**
- Simulates message sending with timeout
- Shows success feedback

**Example Usage:**
```jsx
<MessageAdvisorModal
  advisorId="123"
  advisorName="John Doe"
  onClose={() => setShowModal(false)}
  onMessageSent={handleMessageSent}
/>
```

---

## Additional Directory Components

The following components are also available in the directory folder but require further analysis for complete documentation:

### Search and Filter Components
- `FilterTags.jsx` - Tag-based filtering interface
- `PopularSearches.jsx` - Displays popular search terms
- `RecentlyViewedAdvisors.jsx` - Shows recently viewed advisors
- `SavedSearches.jsx` - Manages saved search queries
- `SaveSearchModal.jsx` - Modal for saving searches
- `SearchAnalytics.jsx` - Search analytics and insights
- `SearchBookmarks.jsx` - Bookmark search functionality
- `SearchCollaboration.jsx` - Collaborative search features
- `SearchComparison.jsx` - Compare search results
- `SearchExport.jsx` - Export search results
- `SearchFeedback.jsx` - Search feedback collection
- `SearchFilterPresets.jsx` - Preset filter configurations
- `SearchFiltersHistory.jsx` - Filter history management
- `SearchHistory.jsx` - Search history tracking
- `SearchInsights.jsx` - Search insights and recommendations
- `SearchInsightsDashboard.jsx` - Comprehensive search insights dashboard
- `SearchNotifications.jsx` - Search-related notifications
- `SearchPreferences.jsx` - User search preferences
- `SearchRecommendations.jsx` - Personalized search recommendations
- `SearchSuggestions.jsx` - Search query suggestions
- `SearchTips.jsx` - Search tips and guidance
- `SearchTrends.jsx` - Search trends analysis
- `ShareSearchModal.jsx` - Share search results

### Results Components
- `SearchResultsAnalytics.jsx` - Analytics for search results
- `SearchResultsCalendar.jsx` - Calendar view of results
- `SearchResultsComparison.jsx` - Compare search results
- `SearchResultsExport.jsx` - Export results functionality
- `SearchResultsMap.jsx` - Map view of advisor locations
- `SearchResultsReviews.jsx` - Reviews in search results
- `SearchResultsSummary.jsx` - Summary of search results
- `SearchResultsTimeline.jsx` - Timeline view of results

### Advisor-Specific Components
- `AdvisorComparison.jsx` - Compare multiple advisors
- `AdvisorLocationMap.jsx` - Map showing advisor locations
- `SimilarAdvisors.jsx` - Find similar advisors
- `SortOptions.jsx` - Sorting options for advisor lists

## Development Notes

1. **Authentication**: Most components that require user data use the `useAuth()` hook from `AuthContext`
2. **Firebase Integration**: Review and notification components heavily integrate with Firestore
3. **Responsive Design**: All components use Tailwind CSS for responsive design
4. **Accessibility**: Components include proper ARIA labels and keyboard navigation
5. **Error Handling**: Most components include error states and loading indicators
6. **PropTypes**: Many components use PropTypes for runtime type checking

## Contributing

When adding new components:
1. Follow the existing naming conventions
2. Add PropTypes for type checking
3. Include loading and error states where appropriate
4. Add proper accessibility attributes
5. Update this documentation

---

*Last updated: [Current Date]*
*Total components documented: 15+ (with 30+ additional components in directory)*