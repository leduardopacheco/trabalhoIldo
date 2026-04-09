package br.unifor.healthsys.pacientes.service;

import br.unifor.healthsys.pacientes.model.Alergia;
import br.unifor.healthsys.pacientes.model.Paciente;
import br.unifor.healthsys.pacientes.model.Paciente.Sexo;
import br.unifor.healthsys.pacientes.repository.AlergiaRepository;
import br.unifor.healthsys.pacientes.repository.PacienteRepository;
import br.unifor.healthsys.pacientes.repository.VacinaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock
    private PacienteRepository pacienteRepository;
    @Mock
    private VacinaRepository vacinaRepository;
    @Mock
    private AlergiaRepository alergiaRepository;

    @InjectMocks
    private PacienteService pacienteService;

    private Paciente paciente;

    @BeforeEach
    void setUp() {
        paciente = Paciente.builder()
                .id(1L)
                .nome("Ana Lima")
                .dataNascimento(LocalDate.of(1990, 5, 15))
                .sexo(Sexo.FEMININO)
                .cpf("123.456.789-00")
                .build();
    }

    @Test
    void listarTodos_deveRetornarLista() {
        when(pacienteRepository.findAll()).thenReturn(List.of(paciente));

        List<Paciente> resultado = pacienteService.listarTodos();

        assertThat(resultado).hasSize(1);
        assertThat(resultado.get(0).getNome()).isEqualTo("Ana Lima");
    }

    @Test
    void buscarPorId_quandoExiste_deveRetornar() {
        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));

        Paciente resultado = pacienteService.buscarPorId(1L);

        assertThat(resultado.getId()).isEqualTo(1L);
    }

    @Test
    void buscarPorId_quandoNaoExiste_deveLancarException() {
        when(pacienteRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pacienteService.buscarPorId(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("não encontrado");
    }

    @Test
    void cadastrar_comCpfDuplicado_deveLancarException() {
        when(pacienteRepository.existsByCpf("123.456.789-00")).thenReturn(true);

        assertThatThrownBy(() -> pacienteService.cadastrar(paciente))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("CPF já cadastrado");
    }

    @Test
    void cadastrar_comCpfNovo_deveSalvar() {
        when(pacienteRepository.existsByCpf(any())).thenReturn(false);
        when(pacienteRepository.save(paciente)).thenReturn(paciente);

        Paciente resultado = pacienteService.cadastrar(paciente);

        assertThat(resultado).isNotNull();
        verify(pacienteRepository).save(paciente);
    }

    @Test
    void registrarAlergia_deveAssociarPacienteESalvar() {
        Alergia alergia = Alergia.builder()
                .descricao("Dipirona")
                .tipo(Alergia.TipoAlergia.MEDICAMENTO)
                .gravidade(Alergia.GravidadeAlergia.GRAVE)
                .build();

        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(alergiaRepository.save(any(Alergia.class))).thenReturn(alergia);

        Alergia resultado = pacienteService.registrarAlergia(1L, alergia);

        assertThat(resultado.getDescricao()).isEqualTo("Dipirona");
        assertThat(alergia.getPaciente()).isEqualTo(paciente);
        verify(alergiaRepository).save(alergia);
    }
}
