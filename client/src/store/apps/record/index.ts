// ** Redux Imports
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// ** Axios Imports
import axios from "axios";

type RecordParams = Promise<{
  user_name: string;
  date?: string;
  start_date?: string;
  end_date?: string;
}>;

type RecordUserIdParams = Promise<{
  user_ids: string;
  start_date?: string;
  end_date?: string;
}>;

type RecordBody = Promise<{
  id?: number;
  user_id: number;
  project_id: number;
  work_package_id: number;
  date: string;
  working_hours: number;
}>;

type ProjectParams = Promise<{
  id?: number;
  project_name: string;
  ref_code: string;
  department_id: number;
  activity: string;
  toast?: any;
}>;

type WorkPackgeParams = Promise<{
  id?: number;
  work_package_name?: string;
  project_id?: number;
  toast?: any;
}>;

type UserParams = Promise<{
  user_name?: string;
}>;

export const API_URL =
  process.env.NODE_ENV === "development" ? process.env.NEXT_PUBLIC_API_URL_DEV : process.env.NEXT_PUBLIC_API_URL;

// const token = "";
// axios.defaults.headers.common = { Authorization: `Bearer ${token}` };
axios.defaults.withCredentials = true;

export const checkAuthHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/auth_health_checker`);
    return response.data.status;
  } catch (error: any) {
    return "";
  }
};
const controller = new AbortController();
const signal = controller.signal;

// ** Fetch Department
export const fetchDepartments = createAsyncThunk("appRecord/fetchDepartments", async (params: any) => {
  try {
    const response = await axios.get(`${API_URL}/api/departments`, {
      params,
      signal,
    });

    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Fetch Team
export const fetchTeams = createAsyncThunk("appRecord/fetchTeams", async (params: any) => {
  try {
    const response = await axios.get(`${API_URL}/api/teams`, {
      params,
      signal,
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Fetch Current Users
export const fetchCurrentUsers = createAsyncThunk("appRecord/fetchCurrentUsers", async (params: UserParams) => {
  try {
    const { user_name } = await params;
    const response = await axios.get(`${API_URL}/api/users`, {
      params: { user_name },
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Fetch User
export const fetchUsers = createAsyncThunk("appRecord/fetchUsers", async () => {
  try {
    const response = await axios.get(`${API_URL}/api/users`, { signal: signal });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Fetch Recent Projects
export const fetchRecentProjects = createAsyncThunk("appRecord/fetchRecentProjects", async (params: RecordParams) => {
  try {
    const { user_name } = await params;
    const response = await axios.get(`${API_URL}/api/records/get_recent_projects`, {
      params: { user_name },
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Fetch Records
export const fetchRecords = createAsyncThunk("appRecord/fetchRecords", async (params: RecordParams) => {
  try {
    const { user_name, start_date, end_date, date } = await params;

    const usersResponse = await axios.get(`${API_URL}/api/users`, {
      params: { user_name },
    });

    const response = await axios.get(`${API_URL}/api/records`, {
      params: { start_date, end_date, date, user_ids: usersResponse.data[0].id },
    });

    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Fetch Sum of Hours
export const fetchSumOfHours = createAsyncThunk("appRecord/fetchSumOfHours", async (params: any) => {
  try {
    // const { year } = params;

    const response = await axios.get(`${API_URL}/api/records/get_sum_hours_projects_in_year`, {
      // params: { year },
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Fetch Sum of Working Hours For Employee
export const fetchSumOfEmployeeWorkingHours = createAsyncThunk(
  "appRecord/fetchSumOfEmployeeWorkingHours",
  async (params: RecordUserIdParams) => {
    try {
      // const { year } = params;
      const { user_ids, start_date, end_date } = await params;
      if (user_ids === "") {
        return {
          data: [],
        };
      }

      const response = await axios.get(`${API_URL}/api/records/get_sum_hours_employees`, {
        params: { user_ids, start_date, end_date },
      });
      return { data: response.data };
    } catch (error: any) {
      return { data: [] };
    }
  },
);

export const fetchSumOfProjectsWorkingHours = createAsyncThunk(
  "appRecord/fetchSumOfProjectsWorkingHours",
  async (params: RecordUserIdParams) => {
    try {
      // const { year } = params;
      const { user_ids, start_date, end_date } = await params;

      if (user_ids === "") {
        return {
          data: [],
        };
      }

      const response = await axios.get(`${API_URL}/api/records/get_sum_hours_projects`, {
        params: { user_ids, start_date, end_date },
      });
      return { data: response.data };
    } catch (error: any) {
      return { data: [] };
    }
  },
);

// ** Fetch Copied Records
export const fetchCopiedRecords = async (params: RecordParams) => {
  try {
    const { user_name, start_date, end_date } = await params;

    const usersResponse = await axios.get(`${API_URL}/api/users`, {
      params: { user_name },
    });

    const response = await axios.get(`${API_URL}/api/records`, {
      params: { start_date, end_date, user_ids: usersResponse.data[0].id },
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
};

// ** Fetch Records by user ids
export const fetchRecordsByUserIds = createAsyncThunk(
  "appRecord/fetchRecordsByUserIds",
  async (params: RecordUserIdParams) => {
    return fetchAllRecords(params);
  },
);

// ** Fetch All Records For Current User in input page
export const fetchRecordsForCurrentUser = createAsyncThunk(
  "appRecord/fetchRecordsForCurrentUser",
  async (params: RecordParams) => {
    return fetchCopiedRecords(params);
  },
);

//fetch all records by user ids
export const fetchAllRecords = async (params: RecordUserIdParams) => {
  try {
    const { user_ids } = await params;
    if (user_ids === "") {
      return {
        data: [],
      };
    }
    const response = await axios.get(`${API_URL}/api/records`, {
      params,
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
};

// ** Add Records
export const addRecords = async (body: RecordBody[]) => {
  try {
    const response = await axios.post(`${API_URL}/api/records`, body);
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
};

// ** Update Records
export const updateRecords = async (body: RecordBody[]) => {
  try {
    const response = await axios.put(`${API_URL}/api/records`, body);
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
};

// ** Delete Each Record
export const deleteRecord = async (ids: number) => {
  try {
    const response = await axios.delete(`${API_URL}/api/records/${ids}`);
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
};
// ** Delete Batch Records
export const deleteBatchRecords = async (ids: number[]) => {
  try {
    const response = await axios.delete(`${API_URL}/api/records/batch_destroy`, {
      data: { ids },
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
};

// ** Fetch Projects
export const fetchProjects = createAsyncThunk("appRecord/fetchProjects", async (params: any) => {
  try {
    const response = await axios.get(`${API_URL}/api/projects`, {
      signal,
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Add Projects
export const addProjects = async (params: ProjectParams) => {
  const { toast, ...body } = await params;
  try {
    await axios.post(`${API_URL}/api/projects`, body);

    toast.success(`Project Added Successfully`, { duration: 5000 });

    return 0;
  } catch (error: any) {
    toast.error(`Server Error. Please contact admin!`, { duration: 5000 });

    return 1;
  }
};

// ** Fetch WorkPackges
export const fetchWorkPackges = createAsyncThunk("appRecord/fetchWorkPackges", async (params: any) => {
  try {
    const response = await axios.get(`${API_URL}/api/work_packages`, {
      params,
      signal,
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

// ** Add WorkPackges
export const addWorkPackges = async (params: WorkPackgeParams) => {
  const { toast, ...body } = await params;
  try {
    await axios.post(`${API_URL}/api/work_packages`, body);

    toast.success(`Work Packge Added Successfully`, { duration: 5000 });

    return 0;
  } catch (error: any) {
    toast.error(`Server Error. Please contact admin!`, { duration: 5000 });

    return 1;
  }
};

// ** Fetch Assets
export const fetchAssets = createAsyncThunk("appRecord/fetchAssets", async (params: any) => {
  try {
    const response = await axios.get(`${API_URL}/api/assets`, {
      params,
      signal,
    });
    return { data: response.data };
  } catch (error: any) {
    return { data: [] };
  }
});

export const appRecordSlice = createSlice({
  name: "appRecord",
  initialState: {
    currentUsers: [],
    users: [],
    departments: [],
    teams: [],
    projects: [],
    recentProjects: [],
    records: [],
    userRecords: [],
    sumOfHours: [],
    workPackges: [],
    assets: [],
    sumOfWorkingHours: [],
    sumOfProjectWorkingHours: [],
    activities: [
      {
        id: 1,
        activity_name: "Digitization Services",
      },
      {
        id: 2,
        activity_name: "Pre-Sales Support",
      },
      {
        id: 3,
        activity_name: "Post Sales Support",
      },
      {
        id: 4,
        activity_name: "Marketing",
      },
      {
        id: 5,
        activity_name: "Software Development",
      },
      {
        id: 6,
        activity_name: "Training",
      },
    ],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCurrentUsers.fulfilled, (state, action) => {
        state.currentUsers = action.payload.data;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload.data;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload.data;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.teams = action.payload.data;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projects = action.payload.data;
      })
      .addCase(fetchRecentProjects.fulfilled, (state, action) => {
        state.recentProjects = action.payload.data;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.records = action.payload.data;
      })
      .addCase(fetchSumOfHours.fulfilled, (state, action) => {
        state.sumOfHours = action.payload.data;
      })
      .addCase(fetchSumOfEmployeeWorkingHours.fulfilled, (state, action) => {
        state.sumOfWorkingHours = action.payload.data;
      })
      .addCase(fetchSumOfProjectsWorkingHours.fulfilled, (state, action) => {
        state.sumOfProjectWorkingHours = action.payload.data;
      })
      .addCase(fetchRecordsByUserIds.fulfilled, (state, action) => {
        state.records = action.payload.data;
      })
      .addCase(fetchRecordsForCurrentUser.fulfilled, (state, action) => {
        state.userRecords = action.payload.data;
      })
      .addCase(fetchWorkPackges.fulfilled, (state, action) => {
        state.workPackges = action.payload.data;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.assets = action.payload.data;
      });
  },
});

export default appRecordSlice.reducer;
