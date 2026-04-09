package br.unifor.healthsys.pacientes.controller;

import br.unifor.healthsys.pacientes.model.Alergia;
import br.unifor.healthsys.pacientes.model.Paciente;
import br.unifor.healthsys.pacientes.model.Vacina;
import br.unifor.healthsys.pacientes.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping
    public ResponseEntity<List<Paciente>> listar(@RequestParam(required = false) String nome) {
        if (nome != null && !nome.isBlank()) {
            return ResponseEntity.ok(pacienteService.buscarPorNome(nome));
        }
        return ResponseEntity.ok(pacienteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paciente> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Paciente> cadastrar(@Valid @RequestBody Paciente paciente) {
        return ResponseEntity.status(201).body(pacienteService.cadastrar(paciente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paciente> atualizar(@PathVariable Long id, @Valid @RequestBody Paciente paciente) {
        return ResponseEntity.ok(pacienteService.atualizar(id, paciente));
    }

    @GetMapping("/{id}/vacinas")
    public ResponseEntity<List<Vacina>> listarVacinas(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteService.listarVacinas(id));
    }

    @PostMapping("/{id}/vacinas")
    public ResponseEntity<Vacina> registrarVacina(@PathVariable Long id, @Valid @RequestBody Vacina vacina) {
        return ResponseEntity.status(201).body(pacienteService.registrarVacina(id, vacina));
    }

    @GetMapping("/{id}/alergias")
    public ResponseEntity<List<Alergia>> listarAlergias(@PathVariable Long id) {
        return ResponseEntity.ok(pacienteService.listarAlergias(id));
    }

    @PostMapping("/{id}/alergias")
    public ResponseEntity<Alergia> registrarAlergia(@PathVariable Long id, @Valid @RequestBody Alergia alergia) {
        return ResponseEntity.status(201).body(pacienteService.registrarAlergia(id, alergia));
    }

    @DeleteMapping("/{id}/alergias/{alergiaId}")
    public ResponseEntity<Void> removerAlergia(@PathVariable Long id, @PathVariable Long alergiaId) {
        pacienteService.removerAlergia(id, alergiaId);
        return ResponseEntity.noContent().build();
    }
}
