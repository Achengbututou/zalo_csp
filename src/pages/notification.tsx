import React, { FC, useState, useEffect, useCallback, useRef } from "react";
import { Box, Header, Page, Text, Button, Icon, Input } from "zmp-ui";
import { useNavigate } from "react-router";
import ImageWithFallback from "components/ImageWithFallback";
import { httpGetMethod } from "utils/http";

// Contact data interface
interface ContactItem {
  f_UserId: string;
  f_RealName: string;
  f_Account: string;
  f_HeadIcon?: string;
  f_DepartmentName?: string;
  f_CompanyName?: string;
  f_DepartmentId?: string;
  f_CompanyId?: string;
}

// Company data interface
interface CompanyItem {
  f_CompanyId: string;
  f_FullName: string;
  f_ParentId?: string;
}

// Department data interface
interface DepartmentItem {
  f_DepartmentId: string;
  f_FullName: string;
  f_ParentId?: string;
}

// Message data interface
interface MessageItem {
  f_Id: string;
  f_SendUserId: string;
  f_ReceiveUserId: string;
  f_Content: string;
  f_Time: string;
  f_NoReadNum: number;
  senderName: string;
  senderAvatar?: string;
}

const ContactList: FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [searchText, setSearchText] = useState("");
  const [contactList, setContactList] = useState<ContactItem[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [departmentName, setDepartmentName] = useState("All");
  const [companyList, setCompanyList] = useState<CompanyItem[]>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState("");
  const [currentDepartmentId, setCurrentDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [records, setRecords] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Get contact data - using real API
  const fetchContacts = useCallback(async (resetList = false, isRefresh = false) => {
    try {
      if (resetList) {
        isRefresh ? setIsRefreshing(true) : setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      // Build request parameters according to original project approach
      const params = {
        rows: 20, // Number of records per page
        page: resetList ? 1 : page, // Current page number
        sidx: 'F_CreateDate DESC', // Sort rule, descending by creation date
        keyword: searchText, // Search keyword
        companyId: currentCompanyId, // Currently selected company ID
        departmentId: currentDepartmentId // Currently selected department ID
      };

      console.log('[Contacts] Getting contact list, parameters:', params);

      // Send HTTP GET request to get user info
      const result = await httpGetMethod('/organization/user/page', params);

      console.log('[Contacts] Contact list response:', result);

      if (result && result.rows) {
        // If resetting list, replace directly; otherwise append
        if (resetList) {
          setContactList(result.rows);
          setFilteredContacts(result.rows);
          setPage(2); // Next page starts from 2
        } else {
          // Filter out user data that already exists in the list
          const newList = result.rows.filter(t => !contactList.some(t2 => t2.f_UserId === t.f_UserId));
          const updatedList = [...contactList, ...newList];
          setContactList(updatedList);
          setFilteredContacts(updatedList);
          setPage(page + 1);
        }

        // Update pagination info
        setTotal(result.total || 1);
        setRecords(result.records || 0);

        // Check if there's more data
        const currentPage = resetList ? 1 : page;
        setHasMore(currentPage < (result.total || 1));
      }

    } catch (error) {
      console.error('[Contacts] Failed to get contacts:', error);
      // If API fails, can choose to show error message or use mock data
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [searchText, currentCompanyId, currentDepartmentId, page, contactList]);

  // Get company list - using real API
  const fetchCompanies = useCallback(async () => {
    try {
      console.log('[Contacts] Getting company list...');
      const companies = await httpGetMethod('/organization/companys', {});
      console.log('[Contacts] Company list response:', companies);

      if (companies && Array.isArray(companies)) {
        setCompanyList(companies);
      }
    } catch (error) {
      console.error('[Contacts] Failed to get company list:', error);
    }
  }, []);

  // Get department list - using real API
  const fetchDepartments = useCallback(async (companyId: string) => {
    try {
      console.log('[Contacts] Getting department list, company ID:', companyId);
      const departments = await httpGetMethod('/organization/departments', { companyId });
      console.log('[Contacts] Department list response:', departments);
      return departments || [];
    } catch (error) {
      console.error('[Contacts] Failed to get department list:', error);
      return [];
    }
  }, []);

  // Search functionality
  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
    // Reset pagination and list
    setPage(1);
    setContactList([]);
    setFilteredContacts([]);
    // Trigger new search
    setTimeout(() => {
      fetchContacts(true);
    }, 100);
  }, [fetchContacts]);

  // Get avatar address - according to original project approach
  const getAvatarSrc = useCallback((contact: ContactItem) => {
    if (!contact.f_HeadIcon) {
      return "/static/img-avatar/head.png";
    }

    // If already a complete URL, return directly
    if (contact.f_HeadIcon.startsWith('http')) {
      return contact.f_HeadIcon;
    }

    // Get token for avatar authentication
    const token = localStorage.getItem('token') ||
                 localStorage.getItem('authToken') ||
                 JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || '';

    // Build avatar URL
    return `https://webapp.crystal-csc.cn/csp_core_api_v3/File/FileDownload/${contact.f_HeadIcon}?token=${token}`;
  }, []);

  // Click contact to enter chat
  const handleContactClick = useCallback((contact: ContactItem) => {
    navigate(`/chat?id=${contact.f_UserId}&name=${contact.f_RealName}`, {
      state: { contact }
    });
  }, [navigate]);

  // Highlight search text - highlighting disabled
  const highlightText = useCallback((text: string, search: string) => {
    return text;
  }, []);

  // Handle department change
  const handleDepartmentChange = useCallback(async (departmentId: string, departmentName: string, isCompany = false) => {
    setDepartmentName(departmentName);
    setCurrentCompanyId(isCompany ? departmentId : "");
    setCurrentDepartmentId(isCompany ? "" : departmentId);
    setPage(1);
    setContactList([]);
    setFilteredContacts([]);
    setHasMore(true);

    // Re-fetch data
    setTimeout(() => {
      fetchContacts(true, false);
    }, 100);
  }, [fetchContacts]);

  // Pull down refresh
  const handleRefresh = useCallback(() => {
    setPage(1);
    setContactList([]);
    setFilteredContacts([]);
    setHasMore(true);
    fetchContacts(true, true);
  }, [fetchContacts]);

  // Reset search and data
  const handleReset = useCallback(() => {
    setSearchText("");
    setPage(1);
    setContactList([]);
    setFilteredContacts([]);
    setHasMore(true);

    // Delay execution to ensure state update
    setTimeout(() => {
      // Call API directly with empty search parameters
      const resetFetch = async () => {
        try {
          setIsRefreshing(true);
          const params = {
            rows: 20,
            page: 1,
            sidx: 'F_CreateDate DESC',
            keyword: "", // Use empty string directly
            companyId: currentCompanyId,
            departmentId: currentDepartmentId
          };

          console.log('[Contacts] Reset search, parameters:', params);
          const result = await httpGetMethod('/organization/user/page', params);

          if (result && result.rows) {
            setContactList(result.rows);
            setFilteredContacts(result.rows);
            setPage(2);
            setTotal(result.total || 1);
            setRecords(result.records || 0);
            setHasMore(1 < (result.total || 1));
          }
        } catch (error) {
          console.error('[Contacts] Reset search failed:', error);
        } finally {
          setIsRefreshing(false);
        }
      };

      resetFetch();
    }, 50);
  }, [currentCompanyId, currentDepartmentId]);

  // Infinite scroll handling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isLoadingMore || !hasMore) return;

    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && hasMore && !isLoadingMore) {
      fetchContacts(false, false);
    }
  }, [isLoadingMore, hasMore, fetchContacts]);

  // Initialize data
  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchContacts(true, false),
        fetchCompanies()
      ]);
    };
    init();
  }, []);

  return (
    <Box className="flex flex-col h-full bg-gray-50">
      {/* Search area - modern design */}
      <Box className="bg-white px-4 py-4 sticky top-0 z-10">
        {/* Main search bar */}
        <Box className="flex items-center space-x-3 mb-3">
          {/* Search box container */}
          <Box className="flex-1 relative">
            <Input
              placeholder="Search contact name or account"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className=" border-gray-300 rounded-md h-8 text-sm placeholder-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 shadow-sm hover:border-gray-400 transition-all duration-200"
            />

            {/* Search box decoration */}
            <Box className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-50/20 to-purple-50/20 pointer-events-none"></Box>
          </Box>

          {/* Reset button */}
          <Button
            size="small"
            variant="tertiary"
            className="h-9 px-2 rounded-md bg-blue-50 border border-blue-200 shadow-sm hover:bg-blue-100 active:scale-95 transition-all duration-200 flex items-center justify-center"
            onClick={handleReset}
            disabled={isRefreshing}
          >
            <Text className="text-blue-600 text-xs font-medium">
              {isRefreshing ? 'Resetting...' : 'Reset'}
            </Text>
          </Button>
        </Box>

        {/* Filter and statistics bar */}
        <Box className="flex items-center justify-between">
          <Box className="flex items-center space-x-3">
            {/* Department tag */}
            <Box className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-full shadow-sm">
              <Text className="text-xs font-medium">{departmentName}</Text>
            </Box>

            {/* Statistics info */}
            <Box className="flex items-baseline bg-gray-100 px-3 py-2 rounded-full">
              <Icon icon="zi-user" className="text-gray-500 text-xs mr-1.5" />
              <Text className="text-xs text-gray-600 font-medium">{records} people</Text>
            </Box>
          </Box>

          {/* Refresh status */}
          {isRefreshing && (
            <Box className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-full">
              <Box className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></Box>
              <Text className="text-xs text-blue-600 font-medium">Refreshing</Text>
            </Box>
          )}
        </Box>

        {/* Bottom divider */}
        <Box className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></Box>
      </Box>

      {/* Contact list - optimized design */}
      <Box
        className="flex-1 overflow-auto"
        style={{ height: 'calc(100vh - 120px)' }}
        onScroll={handleScroll}
      >
        {isLoading ? (
          <Box className="flex items-center justify-center py-20">
            <Box className="text-center">
              <Box className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></Box>
              <Text className="text-gray-500">Loading...</Text>
            </Box>
          </Box>
        ) : (
          <Box className="pb-4">
            {filteredContacts.map((contact, index) => (
              <Box
                key={contact.f_UserId}
                className="bg-white mx-3 my-1.5 p-3 rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer transition-all duration-200 active:scale-98"
                onClick={() => handleContactClick(contact)}
              >
                <Box className="flex items-center">
                  {/* Avatar - optimized design */}
                  <Box className="w-12 h-12 mr-3 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex-shrink-0 shadow-sm">
                    <ImageWithFallback
                      src={getAvatarSrc(contact)}
                      alt={contact.f_RealName}
                      className="w-full h-full object-cover"
                      fallbackType="avatar"
                    />
                  </Box>

                  {/* User info - optimized layout */}
                  <Box className="flex-1 min-w-0">
                    <Box className="flex items-center justify-between mb-0.5">
                      <Text className="text-base font-semibold text-gray-900 truncate">
                        {contact.f_RealName}
                      </Text>
                      {/* <Icon icon="zi-arrow-right" className="text-gray-400 ml-2 flex-shrink-0 text-sm" /> */}
                    </Box>
                    <Box className="flex items-center space-x-2">
                      <Text className="text-sm text-gray-500 truncate">
                        @{contact.f_Account}
                      </Text>
                      {contact.f_DepartmentName && (
                        <Box className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                          {contact.f_DepartmentName}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
            
            {/* Load more status */}
            {isLoadingMore && (
              <Box className="text-center py-4">
                <Box className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-1"></Box>
                <Text className="text-xs text-gray-500">Loading more...</Text>
              </Box>
            )}

            {/* No more data indicator */}
            {!hasMore && filteredContacts.length > 0 && (
              <Box className="text-center py-4">
                <Text className="text-xs text-gray-400">No more data</Text>
              </Box>
            )}
            
            {/* Empty state */}
            {filteredContacts.length === 0 && !isLoading && (
              <Box className="text-center py-16 px-4">
                {searchText ? (
                  /* No search results state */
                  <>
                    <Box className="w-20 h-20 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon icon="zi-search" className="text-orange-400 text-2xl" />
                    </Box>
                    <Text className="text-gray-600 text-lg font-semibold mb-2">
                      No contacts found for "{searchText}"
                    </Text>
                    <Text className="text-gray-400 text-sm mb-4">
                      Try modifying search keywords or check spelling
                    </Text>
                    <Button
                      size="small"
                      variant="tertiary"
                      onClick={() => handleSearch("")}
                      className="bg-blue-50 text-blue-600 border-blue-200 px-4 py-2 rounded-full"
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  /* No contacts state */
                  <>
                    <Box className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon icon="zi-user" className="text-gray-400 text-2xl" />
                    </Box>
                    <Text className="text-gray-500 text-lg font-semibold mb-2">
                      No contacts
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      Contact administrator to add contacts
                    </Text>
                  </>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const ContactPage: FC = () => {
  return (
    <Page className="flex flex-col h-screen">
      {/* <Header title="通讯录" showBackIcon={false} /> */}
      <ContactList />
    </Page>
  );
};

export default ContactPage;
