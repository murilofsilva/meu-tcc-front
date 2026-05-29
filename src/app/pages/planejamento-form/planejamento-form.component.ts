import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlanejamentoService } from '../../services/planejamento.service';
import { AreaConhecimentoService } from '../../services/area-conhecimento.service';
import { NotificationService } from '../../core/notification.service';
import {
  AreaConhecimento,
  CompetenciaComputacao,
  COMPETENCIAS_COMPUTACAO_LABELS,
  CreatePlanejamentoRequest,
  Planejamento,
  UpdatePlanejamentoRequest
} from '../../models/planejamento.models';

interface FormData {
  titulo: string;
  areaConhecimentoId: number | null;
  descricao: string;
  publico: boolean;
  mobilizaCompetenciasComputacao: boolean;
  competenciasComputacao: Record<CompetenciaComputacao, boolean>;
  utilizaRecursosAcessibilidade: boolean;
  descricaoRecursosAcessibilidade: string;
}

@Component({
  selector: 'app-planejamento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './planejamento-form.component.html',
  styleUrls: ['./planejamento-form.component.css']
})
export class PlanejamentoFormComponent implements OnInit {
  private planejamentoService = inject(PlanejamentoService);
  private areaService = inject(AreaConhecimentoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  isEditMode = false;
  planejamentoId?: number;
  planejamento?: Planejamento;

  areas: AreaConhecimento[] = [];

  CompetenciaComputacao = CompetenciaComputacao;
  competenciaOpcoes: CompetenciaComputacao[] = [
    CompetenciaComputacao.PENSAMENTO_COMPUTACIONAL,
    CompetenciaComputacao.CULTURA_DIGITAL,
    CompetenciaComputacao.MUNDO_DIGITAL
  ];
  competenciaLabel = COMPETENCIAS_COMPUTACAO_LABELS;

  formData: FormData = this.estadoInicial();

  isSubmitting = false;

  ngOnInit(): void {
    this.carregarAreas();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.planejamentoId = parseInt(id, 10);
      this.carregarPlanejamento();
    }
  }

  private estadoInicial(): FormData {
    return {
      titulo: '',
      areaConhecimentoId: null,
      descricao: '',
      publico: false,
      mobilizaCompetenciasComputacao: false,
      competenciasComputacao: {
        [CompetenciaComputacao.PENSAMENTO_COMPUTACIONAL]: false,
        [CompetenciaComputacao.CULTURA_DIGITAL]: false,
        [CompetenciaComputacao.MUNDO_DIGITAL]: false
      },
      utilizaRecursosAcessibilidade: false,
      descricaoRecursosAcessibilidade: ''
    };
  }

  carregarAreas(): void {
    this.areaService.listar(true).subscribe({
      next: (areas) => this.areas = areas,
      error: () => this.notificationService.show('Erro ao carregar disciplinas', 'error')
    });
  }

  carregarPlanejamento(): void {
    if (!this.planejamentoId) return;

    this.planejamentoService.buscarPorId(this.planejamentoId).subscribe({
      next: (planejamento) => {
        this.planejamento = planejamento;
        this.formData = {
          titulo: planejamento.titulo,
          areaConhecimentoId: planejamento.areaConhecimento?.id ?? null,
          descricao: planejamento.descricao,
          publico: planejamento.publico,
          mobilizaCompetenciasComputacao: planejamento.mobilizaCompetenciasComputacao,
          competenciasComputacao: {
            [CompetenciaComputacao.PENSAMENTO_COMPUTACIONAL]: planejamento.competenciasComputacao.includes(CompetenciaComputacao.PENSAMENTO_COMPUTACIONAL),
            [CompetenciaComputacao.CULTURA_DIGITAL]: planejamento.competenciasComputacao.includes(CompetenciaComputacao.CULTURA_DIGITAL),
            [CompetenciaComputacao.MUNDO_DIGITAL]: planejamento.competenciasComputacao.includes(CompetenciaComputacao.MUNDO_DIGITAL)
          },
          utilizaRecursosAcessibilidade: planejamento.utilizaRecursosAcessibilidade,
          descricaoRecursosAcessibilidade: planejamento.descricaoRecursosAcessibilidade ?? ''
        };
      },
      error: (error) => {
        this.notificationService.show('Erro ao carregar planejamento', 'error');
        console.error('Erro ao carregar planejamento:', error);
        this.voltarRepositorio();
      }
    });
  }

  onMobilizaCompetenciasChange(): void {
    if (!this.formData.mobilizaCompetenciasComputacao) {
      this.competenciaOpcoes.forEach(c => this.formData.competenciasComputacao[c] = false);
    }
  }

  onAcessibilidadeChange(): void {
    if (!this.formData.utilizaRecursosAcessibilidade) {
      this.formData.descricaoRecursosAcessibilidade = '';
    }
  }

  competenciasSelecionadas(): CompetenciaComputacao[] {
    return this.competenciaOpcoes.filter(c => this.formData.competenciasComputacao[c]);
  }

  onSubmit(): void {
    if (!this.validarFormulario()) return;
    this.isSubmitting = true;

    if (this.isEditMode && this.planejamentoId) {
      this.atualizarPlanejamento();
    } else {
      this.criarPlanejamento();
    }
  }

  validarFormulario(): boolean {
    if (!this.formData.titulo.trim()) {
      this.notificationService.show('Por favor, informe o título do plano de aula', 'error');
      return false;
    }

    if (!this.formData.areaConhecimentoId) {
      this.notificationService.show('Por favor, selecione uma disciplina/área', 'error');
      return false;
    }

    if (!this.formData.descricao.trim() || this.formData.descricao.trim().length < 20) {
      this.notificationService.show('A descrição deve ter pelo menos 20 caracteres', 'error');
      return false;
    }

    if (this.formData.mobilizaCompetenciasComputacao && this.competenciasSelecionadas().length === 0) {
      this.notificationService.show(
        'Selecione ao menos uma competência de computação',
        'error'
      );
      return false;
    }

    if (this.formData.utilizaRecursosAcessibilidade) {
      const desc = this.formData.descricaoRecursosAcessibilidade.trim();
      if (desc.length < 10) {
        this.notificationService.show(
          'Descreva os recursos de acessibilidade utilizados (mínimo 10 caracteres)',
          'error'
        );
        return false;
      }
    }

    return true;
  }

  private montarRequest(): CreatePlanejamentoRequest {
    return {
      titulo: this.formData.titulo.trim(),
      areaConhecimentoId: this.formData.areaConhecimentoId!,
      descricao: this.formData.descricao.trim(),
      publico: this.formData.publico,
      mobilizaCompetenciasComputacao: this.formData.mobilizaCompetenciasComputacao,
      competenciasComputacao: this.formData.mobilizaCompetenciasComputacao
        ? this.competenciasSelecionadas()
        : [],
      utilizaRecursosAcessibilidade: this.formData.utilizaRecursosAcessibilidade,
      descricaoRecursosAcessibilidade: this.formData.utilizaRecursosAcessibilidade
        ? this.formData.descricaoRecursosAcessibilidade.trim()
        : null
    };
  }

  criarPlanejamento(): void {
    this.planejamentoService.criar(this.montarRequest()).subscribe({
      next: () => {
        this.notificationService.show('Plano de aula criado com sucesso!', 'success');
        this.router.navigate(['/repositorio']);
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || error?.error?.mensagem || 'Erro ao criar plano de aula';
        this.notificationService.show(errorMessage, 'error');
        console.error('Erro ao criar planejamento:', error);
      }
    });
  }

  atualizarPlanejamento(): void {
    if (!this.planejamentoId) return;
    const request: UpdatePlanejamentoRequest = this.montarRequest();

    this.planejamentoService.atualizar(this.planejamentoId, request).subscribe({
      next: () => {
        this.notificationService.show('Plano de aula atualizado com sucesso!', 'success');
        this.router.navigate(['/repositorio']);
      },
      error: (error) => {
        this.isSubmitting = false;
        const errorMessage = error?.error?.message || error?.error?.mensagem || 'Erro ao atualizar plano de aula';
        this.notificationService.show(errorMessage, 'error');
        console.error('Erro ao atualizar planejamento:', error);
      }
    });
  }

  copiarCodigo(): void {
    const codigo = this.planejamento?.codigo;
    if (!codigo) return;
    navigator.clipboard.writeText(codigo).then(
      () => this.notificationService.show(`Código ${codigo} copiado!`, 'success'),
      () => this.notificationService.show('Não foi possível copiar', 'error')
    );
  }

  voltarRepositorio(): void {
    this.router.navigate(['/repositorio']);
  }

  cancelar(): void {
    if (this.formularioAlterado()) {
      if (confirm('Você tem alterações não salvas. Deseja realmente sair?')) {
        this.voltarRepositorio();
      }
    } else {
      this.voltarRepositorio();
    }
  }

  formularioAlterado(): boolean {
    if (!this.isEditMode) {
      return !!(this.formData.titulo || this.formData.areaConhecimentoId || this.formData.descricao);
    }
    if (!this.planejamento) return false;
    return (
      this.formData.titulo !== this.planejamento.titulo ||
      this.formData.areaConhecimentoId !== (this.planejamento.areaConhecimento?.id ?? null) ||
      this.formData.descricao !== this.planejamento.descricao ||
      this.formData.publico !== this.planejamento.publico ||
      this.formData.mobilizaCompetenciasComputacao !== this.planejamento.mobilizaCompetenciasComputacao ||
      this.formData.utilizaRecursosAcessibilidade !== this.planejamento.utilizaRecursosAcessibilidade
    );
  }
}
