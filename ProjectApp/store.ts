import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export type Role = 'manager' | 'supervisor';

export interface User {
  id: string; // Used as username/login name for simplicity
  name: string;
  role: Role;
  passwordHash: string; // Plaintext for prototyping
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  phone: string;
  projectId: string; // which project this worker belongs to
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  timestamp: string; // ISO date string
  location: { latitude: number; longitude: number } | null;
  photoUri: string | null;
  verified: boolean;
  projectId: string;
}

export interface Material {
  id: string;
  projectId: string;
  name: string;
  unit: string;
  quantity: number;
  costPerUnit?: number;
  isHighValue?: boolean;
}

export interface Equipment {
  id: string;
  projectId: string;
  name: string;
  type: string;
  status: 'available' | 'in_use' | 'maintenance' | 'broken';
  operatorId?: string;
  serialNumber?: string;
}

export type MaterialLogType = 'delivery' | 'usage' | 'damage';

export interface MaterialLog {
  id: string;
  projectId: string;
  materialId: string;
  type: MaterialLogType;
  amount: number;
  timestamp: string;
  notes: string;
  supervisorId: string;
  photoUri?: string | null;
  receiptUri?: string | null;
  location?: { latitude: number; longitude: number } | null;
  taskId?: string | null;
  weatherCondition?: string | null;
  workPhase?: string | null;
  workScale?: number | null;
  workScaleUnit?: string | null;
  costPerUnit?: number;
}

export interface Project {
  id: string;
  name: string;
  managerId: string;
  projectCode: string; // Unique code supervisors use to join
  geofenceRadius: number; // in meters
  geofenceCenter: { latitude: number; longitude: number } | null;
  totalRegisteredEquipment: number; // New field for Resource Score calculation
  startDate: string; // ISO date string - Days from project start calculation
}

// Map supervisor to project
export interface UserProjectMap {
  userId: string;
  projectId: string;
}

export interface DailyLog {
  id: string;
  projectId: string;
  supervisorId: string;
  content: string;
  timestamp: string;
  photoUri?: string | null;
}

export interface Task {
  id: string;
  projectId: string;
  assignorId: string; // The user who created/assigned the task
  title: string;
  description: string;
  isDone: boolean;
  timestamp: string;
  type: 'manager' | 'own';
  // AI-Specific Features
  durationDays: number;
  plannedFinishDate: string;
  laborRequired: number;
  equipmentRequired: number;
  materialCost: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  parentTaskIds: string[]; // Dependencies
  plannedStartDate: string;
  earliestStartDate: string; // The date the task COULD actually start (after blockers)
  actualFinishDate?: string; 
  predictedDelayDays?: number;
  delayProbability?: number;
  riskFactors?: Record<string, number>; // SHAP values
}

export interface Incident {
  id: string;
  projectId: string;
  supervisorId: string;
  type: 'accident' | 'damage' | 'theft' | 'other';
   severity?: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  photoUri?: string | null;
}

export type DocumentCategory = 'Site Plan' | 'Receipt' | 'Permit' | 'Invoice' | 'Other';

export interface DocumentRecord {
  id: string;
  projectId: string;
  uploaderId: string;
  name: string;
  uri: string;
  category: DocumentCategory;
  timestamp: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';

// Legacy model structures removed

export interface AppState {
  currentUser: User | null;
  activeProject: Project | null;
  themePreference: 'light' | 'dark' | 'system';
  
  users: User[];
  projects: Project[];
  userProjectLinks: UserProjectMap[]; // Supervisors accessing projects
  
  workers: Worker[];
  attendanceLogs: AttendanceRecord[];

  materials: Material[];
  materialLogs: MaterialLog[];
  
  dailyLogs: DailyLog[];
  tasks: Task[];
  incidents: Incident[];
  documents: DocumentRecord[];
  equipments: Equipment[];

  // Auth
  registerUser: (user: User) => boolean;
  loginUser: (username: string, pass: string) => boolean;
  logout: () => void;
  
  // Projects
  setActiveProject: (projectId: string) => void;
  createProject: (project: Project) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  joinProject: (projectCode: string) => boolean;
  setThemePreference: (theme: 'light' | 'dark' | 'system') => void;
  
  // Actions
  addWorker: (worker: Worker) => void;
  updateWorker: (workerId: string, updates: Partial<Worker>) => void;
  deleteWorker: (workerId: string) => void;
  
  addAttendanceRecord: (record: AttendanceRecord) => void;

  addMaterial: (material: Material) => void;
  logMaterialTransaction: (log: MaterialLog) => void;
  
  // New Tools
  addDailyLog: (log: DailyLog) => void;
  addTask: (task: Task) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  addIncident: (incident: Incident) => void;
  addDocument: (doc: DocumentRecord) => void;
  
  addEquipment: (equipment: Equipment) => void;
  updateEquipment: (equipmentId: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (equipmentId: string) => void;

  // AI Score Calculation Utilities
  calculateResourceScore: (projectId: string) => number;
  calculateSiteScore: (projectId: string) => number;
  getAIPrediction: (taskId: string) => Promise<void>;
  
  deleteProject: (projectId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      activeProject: null,
      themePreference: 'system',
      
      users: [],
      projects: [],
      userProjectLinks: [],
      
      workers: [],
      attendanceLogs: [],

      materials: [],
      materialLogs: [],
      
      dailyLogs: [],
      tasks: [],
      incidents: [],
      documents: [],
      equipments: [],

      registerUser: (newUser) => {
        const { users } = get();
        if (users.find(u => u.id === newUser.id)) {
          return false; // Username exists
        }
        set({ users: [...users, newUser] });
        return true;
      },

      loginUser: (username, pass) => {
        const { users } = get();
        const user = users.find(u => u.id === username && u.passwordHash === pass);
        if (user) {
          set({ currentUser: user, activeProject: null });
          return true;
        }
        return false;
      },

      logout: () => set({ currentUser: null, activeProject: null }),

      setActiveProject: (projectId) => {
        if (!projectId) {
           set({ activeProject: null });
           return;
        }
        const project = get().projects.find(p => p.id === projectId);
        if (project) {
          set({ activeProject: project });
        }
      },

      createProject: (project) => {
         set((state) => ({ 
           projects: [...state.projects, project],
         }));
      },

      updateProject: (projectId, updates) => {
         set((state) => ({
             projects: state.projects.map(p => p.id === projectId ? { ...p, ...updates } : p),
             activeProject: state.activeProject?.id === projectId ? { ...state.activeProject, ...updates } : state.activeProject
         }));
      },

      joinProject: (projectCode) => {
        const { projects, userProjectLinks, currentUser } = get();
        const project = projects.find(p => p.projectCode === projectCode);
        if (project && currentUser) {
          // Check if already joined
          const alreadyJoined = userProjectLinks.find(
            link => link.userId === currentUser.id && link.projectId === project.id
          );
          if (!alreadyJoined) {
             set({
               userProjectLinks: [...userProjectLinks, { userId: currentUser.id, projectId: project.id }]
             });
          }
          return true;
        }
        return false;
      },
      
      setThemePreference: (theme) => set({ themePreference: theme }),
      
      deleteProject: (projectId) => set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId),
        activeProject: state.activeProject?.id === projectId ? null : state.activeProject,
        userProjectLinks: state.userProjectLinks.filter(l => l.projectId !== projectId),
        tasks: state.tasks.filter(t => t.projectId !== projectId),
        workers: state.workers.filter(w => w.projectId !== projectId),
        attendanceLogs: state.attendanceLogs.filter(l => l.projectId !== projectId),
        materialLogs: state.materialLogs.filter(l => l.projectId !== projectId),
        dailyLogs: state.dailyLogs.filter(l => l.projectId !== projectId),
        incidents: state.incidents.filter(i => i.projectId !== projectId),
        equipments: state.equipments.filter(e => e.projectId !== projectId),
        documents: state.documents.filter(d => d.projectId !== projectId),
        materials: state.materials.filter(m => m.projectId !== projectId),
      })),

      addWorker: (worker) =>
        set((state) => ({ workers: [...state.workers, worker] })),

      updateWorker: (workerId, updates) => 
        set((state) => ({
          workers: state.workers.map(w => w.id === workerId ? { ...w, ...updates } : w)
        })),

      deleteWorker: (workerId) => 
        set((state) => ({
          workers: state.workers.filter(w => w.id !== workerId)
        })),

      addAttendanceRecord: (record) =>
        set((state) => ({ attendanceLogs: [...state.attendanceLogs, record] })),

      addMaterial: (material) =>
        set((state) => ({ materials: [...state.materials, material] })),

      logMaterialTransaction: (log) =>
        set((state) => {
          const materialExists = state.materials.find(m => m.id === log.materialId);
          let newMaterials = state.materials;
          if (materialExists) {
             newMaterials = state.materials.map(m => {
                if (m.id === log.materialId) {
                   const change = log.type === 'delivery' ? log.amount : -log.amount;
                   const updatedCostPerUnit = log.type === 'delivery' && log.costPerUnit ? log.costPerUnit : m.costPerUnit;
                   return { ...m, quantity: m.quantity + change, costPerUnit: updatedCostPerUnit };
                }
                return m;
             });
          }
          return {
             materialLogs: [...state.materialLogs, log],
             materials: newMaterials
          };
        }),

      addDailyLog: (log) => set((state) => ({ dailyLogs: [log, ...state.dailyLogs] })),
      addTask: (task) => {
        set((state) => ({ tasks: [task, ...state.tasks] }));
        if (task.type === 'manager') {
          get().getAIPrediction(task.id);
        }
      },
      toggleTask: (taskId) => set((state) => ({
        tasks: state.tasks.map(t => t.id === taskId ? { 
          ...t, 
          isDone: !t.isDone,
          actualFinishDate: !t.isDone ? new Date().toISOString() : undefined 
        } : t)
      })),
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      })),
      addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),
      addDocument: (doc) => set((state) => ({ documents: [doc, ...state.documents] })),

      addEquipment: (equipment) => set((state) => ({ equipments: [...state.equipments, equipment] })),
      updateEquipment: (equipmentId, updates) => set((state) => ({
        equipments: state.equipments.map(e => e.id === equipmentId ? { ...e, ...updates } : e)
      })),
      deleteEquipment: (equipmentId) => set((state) => ({
        equipments: state.equipments.filter(e => e.id !== equipmentId)
      })),

      calculateResourceScore: (projectId) => {
        const { tasks, workers, projects } = get();
        const project = projects.find(p => p.id === projectId);
        if (!project) return 0;

        const today = new Date().toISOString().split('T')[0];
        const activeTasks = tasks.filter(t => 
          t.projectId === projectId && 
          !t.isDone && 
          t.plannedStartDate <= today && 
          t.plannedFinishDate >= today
        );
        const totalLaborNeeded = activeTasks.reduce((sum, t) => sum + (t.laborRequired || 0), 0);
        const totalEquipNeeded = activeTasks.reduce((sum, t) => sum + (t.equipmentRequired || 0), 0);
        
        const totalWorkers = workers.filter(w => w.projectId === projectId).length || 1;
        const totalEquip = get().equipments.filter(e => e.projectId === projectId).length || project.totalRegisteredEquipment || 1;

        const laborPressure = totalLaborNeeded / totalWorkers;
        const equipPressure = totalEquipNeeded / totalEquip;

        // Resource Score is the average of labor and equipment pressure (capped at 1.0)
        return Math.min(1.0, (laborPressure + equipPressure) / 2);
      },

      calculateSiteScore: (projectId) => {
        const { incidents, tasks } = get();
        
        // 1. Incident Density (Active Incidents / Active Tasks)
        const activeTasksCount = tasks.filter(t => t.projectId === projectId && !t.isDone).length || 1;
        const recentIncidentsCount = incidents.filter(i => i.projectId === projectId).length;
        const incidentFactor = Math.min(1.0, recentIncidentsCount / activeTasksCount);

        // 2. Placeholder for Weather Impact (Simulated for now, would connect to API)
        const weatherFactor = 0.2; 

        // 3. Placeholder for Holiday Friction
        const holidayFactor = 0.0;

        // 4. Placeholder for Accessibility (Site Location)
        const accessFactor = 0.3;

        // Final Site Score is weighted average of these 4 variables
        return (incidentFactor * 0.4) + (weatherFactor * 0.3) + (holidayFactor * 0.2) + (accessFactor * 0.1);
      },

      getAIPrediction: async (taskId) => {
        const { tasks, calculateResourceScore, calculateSiteScore } = get();
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // Gather the 9 features from our Final Blueprint
        const project = get().projects.find(p => p.id === task.projectId);
        const pDate = new Date(task.plannedStartDate);
        const eDate = new Date(task.earliestStartDate);
        const projectStart = project ? new Date(project.startDate) : pDate;
        
        // 1. Initial Site Delay (Manual Constraint)
        const initialDelay = Math.max(0, Math.ceil((eDate.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24)));

        // 2. Dependency Delay (Cascading AI Prediction)
        let dependencyDelay = 0;
        if (task.parentTaskIds && task.parentTaskIds.length > 0) {
          task.parentTaskIds.forEach(pid => {
            const parent = tasks.find(t => t.id === pid);
            if (parent) {
              const pFinish = new Date(parent.plannedFinishDate);
              const pDelay = parent.predictedDelayDays || 0;
              // Expected completion of parent = Planned Finish + Predicted Delay
              const expectedParentFinish = new Date(pFinish.getTime() + (pDelay * 24 * 60 * 60 * 1000));
              
              if (expectedParentFinish > pDate) {
                const diff = Math.ceil((expectedParentFinish.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diff > dependencyDelay) dependencyDelay = diff;
              }
            }
          });
        }
        
        // Final Start_Constraint is the maximum of site blockers or dependency delays
        const startConstraint = Math.max(initialDelay, dependencyDelay);

        const payload = {
          features: {
            Task_Duration_Days: task.durationDays,
            Labor_Required: task.laborRequired,
            Equipment_Units: task.equipmentRequired,
            Material_Cost_KSH: task.materialCost,
            Start_Constraint: startConstraint,
            Risk_Level: task.riskLevel.charAt(0).toUpperCase() + task.riskLevel.slice(1).toLowerCase(), // 'Low', 'Medium', 'High'
            Resource_Constraint_Score: calculateResourceScore(task.projectId),
            Site_Constraint_Score: calculateSiteScore(task.projectId),
            Dependency_Count: task.parentTaskIds.length
          }
        };

        try {
          // Dynamically determine the packager IP
          let hostIp = '127.0.0.1';
          if (Platform.OS === 'android' && !Constants.isDevice) {
            hostIp = '10.0.2.2';
          } else {
            const hostUri = Constants.expoConfig?.hostUri;
            if (hostUri) {
              hostIp = hostUri.split(':')[0];
            } else if (Constants.experienceUrl) {
              const match = Constants.experienceUrl.match(/:\/\/([^:/]+)/);
              if (match) hostIp = match[1];
            }
          }
          
          const ML_URL = `http://${hostIp}:5000`;
          
          // Add a short timeout so it fails quickly instead of OS-level hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(`${ML_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal as any
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) throw new Error('Prediction service failed');
          
          const result = await response.json();
          
          // Update the task in the store
          set((state) => ({
            tasks: state.tasks.map(t => t.id === taskId ? {
              ...t,
              predictedDelayDays: result.predicted_delay_days,
              delayProbability: result.delay_probability,
              riskFactors: result.risk_factors
            } : t)
          }));
        } catch (error: any) {
          // Gracefully suppress the exact timeout error the user wants to avoid, or handle AbortError
          if (error?.message?.includes('timed out') || error?.name === 'AbortError' || error?.message?.includes('Network request failed')) {
             console.log("AI Prediction Service unreachable. Please ensure the ML service is running locally.");
          } else {
             console.error("AI Prediction Error:", error);
          }
        }
      },
    }),
    {
      name: 'multimodal-verification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
