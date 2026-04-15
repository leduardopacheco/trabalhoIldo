package br.unifor.healthsys.prontuario.controller;

import br.unifor.healthsys.prontuario.model.*;
import br.unifor.healthsys.prontuario.service.ProntuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/prontuarios")
@RequiredArgsConstructor
public class ProntuarioController {

    private final ProntuarioService prontuarioService;

    @GetMapping("/paciente/{idPaciente}")
    public ResponseEntity<Prontuario> buscarPorPaciente(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(prontuarioService.buscarPorPaciente(idPaciente));
    }

    @PostMapping("/paciente/{idPaciente}")
    public ResponseEntity<Prontuario> criarOuBuscar(@PathVariable Long idPaciente) {
        return ResponseEntity.ok(prontuarioService.criarOuBuscar(idPaciente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Prontuario> atualizar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(prontuarioService.atualizar(
                id,
                body.get("historicoClinico"),
                body.get("observacoesGerais")
        ));
    }

    @GetMapping("/{id}/consultas")
    public ResponseEntity<List<Consulta>> listarConsultas(@PathVariable Long id) {
        return ResponseEntity.ok(prontuarioService.listarConsultas(id));
    }

    @PostMapping("/{id}/consultas")
    public ResponseEntity<Consulta> adicionarConsulta(@PathVariable Long id, @Valid @RequestBody Consulta consulta) {
        return ResponseEntity.status(201).body(prontuarioService.adicionarConsulta(id, consulta));
    }

    @GetMapping("/{id}/exames")
    public ResponseEntity<List<Exame>> listarExames(@PathVariable Long id) {
        return ResponseEntity.ok(prontuarioService.listarExames(id));
    }

    @PostMapping("/{id}/exames")
    public ResponseEntity<Exame> adicionarExame(@PathVariable Long id, @Valid @RequestBody Exame exame) {
        return ResponseEntity.status(201).body(prontuarioService.adicionarExame(id, exame));
    }

    @GetMapping("/{id}/medicamentos")
    public ResponseEntity<List<Medicamento>> listarMedicamentos(@PathVariable Long id) {
        return ResponseEntity.ok(prontuarioService.listarMedicamentos(id));
    }

    @PostMapping("/{id}/consultas/{idConsulta}/medicamentos")
    public ResponseEntity<Medicamento> adicionarMedicamento(
            @PathVariable Long id,
            @PathVariable Long idConsulta,
            @Valid @RequestBody Medicamento medicamento) {
        return ResponseEntity.status(201).body(prontuarioService.adicionarMedicamento(id, idConsulta, medicamento));
    }
}
