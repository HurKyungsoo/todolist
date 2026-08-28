package com.portfolio.todolist.service;

import com.portfolio.todolist.config.JwtTokenProvider;
import com.portfolio.todolist.dto.LoginRequestDto;
import com.portfolio.todolist.dto.LoginResponseDto;
import com.portfolio.todolist.dto.UserResponseDto;
import com.portfolio.todolist.dto.UserSignupRequestDto;
import com.portfolio.todolist.entity.User;
import com.portfolio.todolist.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public UserResponseDto signup(UserSignupRequestDto request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("이미 사용중인 username입니다.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 email입니다.");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .build();
        return new UserResponseDto(userRepository.save(user));
    }

    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다."));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 일치하지 않습니다.");
        }
        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername());
        return new LoginResponseDto(token, user.getId(), user.getUsername());
    }
}
