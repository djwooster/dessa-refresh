export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      yearly_setups: {
        Row: {
          id: string;
          is_default: boolean;
          group_name: string | null;
          year: string;
          window_count: number;
          dates: string[];
          assessment_type: "screener" | "full";
          conditional_assignment: boolean;
          t_score: string;
          reset_behavior: "rescreen" | "skip";
          same_config_all_windows: boolean;
          site_leader_manage: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["yearly_setups"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["yearly_setups"]["Insert"]>;
      };
      yearly_setup_sites: {
        Row: {
          id: string;
          setup_id: string;
          site_name: string;
        };
        Insert: Omit<Database["public"]["Tables"]["yearly_setup_sites"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["yearly_setup_sites"]["Insert"]>;
      };
      yearly_setup_window_configs: {
        Row: {
          id: string;
          setup_id: string;
          window_index: number;
          conditional_assignment: boolean;
          t_score: string;
          reset_behavior: "rescreen" | "skip";
        };
        Insert: Omit<Database["public"]["Tables"]["yearly_setup_window_configs"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["yearly_setup_window_configs"]["Insert"]>;
      };
    };
  };
}

export type YearlySetup = Database["public"]["Tables"]["yearly_setups"]["Row"];
export type YearlySetupSite = Database["public"]["Tables"]["yearly_setup_sites"]["Row"];
export type YearlySetupWindowConfig = Database["public"]["Tables"]["yearly_setup_window_configs"]["Row"];
