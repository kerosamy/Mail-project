package com.example.mail.Service.Filter;

import com.example.mail.model.Email;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FolderFilter implements Filter<Email> {

    @Override
    public List<Email> applyFilter(List<Email> emails, String type) {
        return emails.stream()
                .filter(email -> email.getFoldersNames().contains(type))
                .collect(Collectors.toList());
    }
}