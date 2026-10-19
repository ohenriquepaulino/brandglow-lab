export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ab_visitas: {
        Row: {
          criado_em: string
          id: string
          teste: string
          utm_campaign: string | null
          utm_content: string | null
          utm_source: string | null
          variante: string
          via_split: boolean
          visitante: string
        }
        Insert: {
          criado_em?: string
          id?: string
          teste?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_source?: string | null
          variante: string
          via_split?: boolean
          visitante: string
        }
        Update: {
          criado_em?: string
          id?: string
          teste?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_source?: string | null
          variante?: string
          via_split?: boolean
          visitante?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      followup_leads: {
        Row: {
          lead_id: string
          lido_em: string
          tipo: string
          ultima_de: string
          ultima_msg_em: string
        }
        Insert: {
          lead_id: string
          lido_em?: string
          tipo: string
          ultima_de: string
          ultima_msg_em: string
        }
        Update: {
          lead_id?: string
          lido_em?: string
          tipo?: string
          ultima_de?: string
          ultima_msg_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "followup_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      followup_resumos: {
        Row: {
          data: string
          enviado_em: string
          itens: Json
        }
        Insert: {
          data: string
          enviado_em?: string
          itens?: Json
        }
        Update: {
          data?: string
          enviado_em?: string
          itens?: Json
        }
        Relationships: []
      }
      historico_movimentacoes: {
        Row: {
          coluna_destino: string
          coluna_origem: string
          id: string
          lead_id: string
          movido_em: string
        }
        Insert: {
          coluna_destino: string
          coluna_origem: string
          id?: string
          lead_id: string
          movido_em?: string
        }
        Update: {
          coluna_destino?: string
          coluna_origem?: string
          id?: string
          lead_id?: string
          movido_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_movimentacoes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          anotacoes: string | null
          coluna: string
          criado_em: string
          faturamento: string
          ganho_em: string | null
          gclid: string | null
          id: string
          instagram: string | null
          momento_negocio: string | null
          nome: string
          pagina: string | null
          profissao: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          valor_fechado: number | null
          verba_marca: string | null
          whatsapp: string
        }
        Insert: {
          anotacoes?: string | null
          coluna?: string
          criado_em?: string
          faturamento: string
          ganho_em?: string | null
          gclid?: string | null
          id?: string
          instagram?: string | null
          momento_negocio?: string | null
          nome: string
          pagina?: string | null
          profissao?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor_fechado?: number | null
          verba_marca?: string | null
          whatsapp: string
        }
        Update: {
          anotacoes?: string | null
          coluna?: string
          criado_em?: string
          faturamento?: string
          ganho_em?: string | null
          gclid?: string | null
          id?: string
          instagram?: string | null
          momento_negocio?: string | null
          nome?: string
          pagina?: string | null
          profissao?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          valor_fechado?: number | null
          verba_marca?: string | null
          whatsapp?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          case_slugs: string[] | null
          cash_discount_pct: number
          cash_note: string
          client_name: string
          cover_label: string
          created_at: string
          deadline_days: number
          diagnosis_challenge: string | null
          diagnosis_goal: string | null
          diagnosis_moment: string | null
          id: string
          installments: number
          installments_note: string
          price_total: number
          product: string
          show_diagnosis: boolean
          slug: string
          updated_at: string
          valid_until: string | null
          whatsapp: string | null
        }
        Insert: {
          case_slugs?: string[] | null
          cash_discount_pct?: number
          cash_note?: string
          client_name?: string
          cover_label?: string
          created_at?: string
          deadline_days?: number
          diagnosis_challenge?: string | null
          diagnosis_goal?: string | null
          diagnosis_moment?: string | null
          id?: string
          installments?: number
          installments_note?: string
          price_total?: number
          product?: string
          show_diagnosis?: boolean
          slug: string
          updated_at?: string
          valid_until?: string | null
          whatsapp?: string | null
        }
        Update: {
          case_slugs?: string[] | null
          cash_discount_pct?: number
          cash_note?: string
          client_name?: string
          cover_label?: string
          created_at?: string
          deadline_days?: number
          diagnosis_challenge?: string | null
          diagnosis_goal?: string | null
          diagnosis_moment?: string | null
          id?: string
          installments?: number
          installments_note?: string
          price_total?: number
          product?: string
          show_diagnosis?: boolean
          slug?: string
          updated_at?: string
          valid_until?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      task_lists: {
        Row: {
          created_at: string
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          concluida: boolean
          created_at: string
          data_conclusao: string | null
          descricao: string | null
          id: string
          lead_id: string | null
          list_id: string
          ordem: number
          titulo: string
        }
        Insert: {
          concluida?: boolean
          created_at?: string
          data_conclusao?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          list_id: string
          ordem?: number
          titulo: string
        }
        Update: {
          concluida?: boolean
          created_at?: string
          data_conclusao?: string | null
          descricao?: string | null
          id?: string
          lead_id?: string | null
          list_id?: string
          ordem?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "task_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      video_eventos: {
        Row: {
          criado_em: string
          de_seg: number | null
          id: string
          posicao_seg: number
          sessao_id: string
          tipo: string
        }
        Insert: {
          criado_em?: string
          de_seg?: number | null
          id?: string
          posicao_seg?: number
          sessao_id: string
          tipo: string
        }
        Update: {
          criado_em?: string
          de_seg?: number | null
          id?: string
          posicao_seg?: number
          sessao_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_eventos_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "video_sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      video_links: {
        Row: {
          criado_em: string
          destinatario: string
          id: string
          lead_id: string | null
          slug: string
          video_id: string
        }
        Insert: {
          criado_em?: string
          destinatario: string
          id?: string
          lead_id?: string | null
          slug: string
          video_id: string
        }
        Update: {
          criado_em?: string
          destinatario?: string
          id?: string
          lead_id?: string | null
          slug?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_links_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_links_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_sessoes: {
        Row: {
          assistidos: number[]
          chegou_ao_fim: boolean
          deu_play: boolean
          dispositivo: string
          id: string
          iniciado_em: string
          link_id: string
          maximo_seg: number
          posicao_seg: number
          resumo_pendente: boolean
          resumos_enviados: number
          ultimo_evento_em: string
          visitante: string
        }
        Insert: {
          assistidos?: number[]
          chegou_ao_fim?: boolean
          deu_play?: boolean
          dispositivo?: string
          id?: string
          iniciado_em?: string
          link_id: string
          maximo_seg?: number
          posicao_seg?: number
          resumo_pendente?: boolean
          resumos_enviados?: number
          ultimo_evento_em?: string
          visitante: string
        }
        Update: {
          assistidos?: number[]
          chegou_ao_fim?: boolean
          deu_play?: boolean
          dispositivo?: string
          id?: string
          iniciado_em?: string
          link_id?: string
          maximo_seg?: number
          posicao_seg?: number
          resumo_pendente?: boolean
          resumos_enviados?: number
          ultimo_evento_em?: string
          visitante?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_sessoes_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "video_links"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          criado_em: string
          duracao_seg: number | null
          id: string
          titulo: string
          youtube_id: string
        }
        Insert: {
          criado_em?: string
          duracao_seg?: number | null
          id?: string
          titulo: string
          youtube_id: string
        }
        Update: {
          criado_em?: string
          duracao_seg?: number | null
          id?: string
          titulo?: string
          youtube_id?: string
        }
        Relationships: []
      }
      whatsapp_config: {
        Row: {
          ativo: boolean
          atraso_segundos: number
          aviso_ativo: boolean
          aviso_grupo_convite: string | null
          aviso_grupo_id: string | null
          aviso_grupo_nome: string | null
          cron_token: string
          followup_lido_em: string | null
          followup_resumo_ativo: boolean
          id: number
          mensagem: string
          mensagem_ate_6k: string
          updated_at: string
          webhook_registrado: boolean
          webhook_token: string
        }
        Insert: {
          ativo?: boolean
          atraso_segundos?: number
          aviso_ativo?: boolean
          aviso_grupo_convite?: string | null
          aviso_grupo_id?: string | null
          aviso_grupo_nome?: string | null
          cron_token?: string
          followup_lido_em?: string | null
          followup_resumo_ativo?: boolean
          id?: number
          mensagem?: string
          mensagem_ate_6k?: string
          updated_at?: string
          webhook_registrado?: boolean
          webhook_token?: string
        }
        Update: {
          ativo?: boolean
          atraso_segundos?: number
          aviso_ativo?: boolean
          aviso_grupo_convite?: string | null
          aviso_grupo_id?: string | null
          aviso_grupo_nome?: string | null
          cron_token?: string
          followup_lido_em?: string | null
          followup_resumo_ativo?: boolean
          id?: number
          mensagem?: string
          mensagem_ate_6k?: string
          updated_at?: string
          webhook_registrado?: boolean
          webhook_token?: string
        }
        Relationships: []
      }
      whatsapp_envios: {
        Row: {
          criado_em: string
          enviar_em: string
          erro: string | null
          id: string
          lead_id: string | null
          mensagem: string
          status: string
          telefone: string
          tipo: string
        }
        Insert: {
          criado_em?: string
          enviar_em?: string
          erro?: string | null
          id?: string
          lead_id?: string | null
          mensagem: string
          status: string
          telefone: string
          tipo?: string
        }
        Update: {
          criado_em?: string
          enviar_em?: string
          erro?: string | null
          id?: string
          lead_id?: string | null
          mensagem?: string
          status?: string
          telefone?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_envios_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ab_campanhas: {
        Args: { p_teste: string }
        Returns: {
          campanha: string
          visitantes: number
        }[]
      }
      ab_resumo: {
        Args: { p_campanha: string; p_desde: string; p_teste: string }
        Returns: {
          variante: string
          visitantes: number
          visitas: number
        }[]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      video_registrar: {
        Args: {
          p_fim: boolean
          p_play: boolean
          p_posicao: number
          p_segundos: number[]
          p_sessao: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
